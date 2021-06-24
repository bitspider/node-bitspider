/********************************************************************************
 * MIT License
 * 
 * Copyright (c) 2021 BitSpider
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE. 
 ********************************************************************************/
 
const fetch = require('node-fetch');

const { EventEmitter } = require('events');

/******************************************************************************************
 * Convert object to query string
 ******************************************************************************************/
function toQueryString(obj) {
  var str = [ ];
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  }
  return str.join("&");
}

/**************************************************************************************//**
 * BitSpider REST API client
 * @class
 ******************************************************************************************/
class BitSpider extends EventEmitter {
  /******************************************************************************************
   * Constructor
   * @param options { baseUrl, apiKey, apiSecret }
   * @constructs
   ******************************************************************************************/
  constructor(options) {
    super();

    this.options = options || { };

    //Default base URL
    if (!this.options.baseUrl) {
      this.options.baseUrl = "https://api.bitspider.com/v1";
    }

    //Default User-Agent
    if (this.options.userAgent) {
      try {
        const os = require("os");
        const path = require("path");
        const pkg = require(path.join(__dirname, "..", "package.json"));
        let userAgent = pkg.name + "/" + pkg.version + " (" + "node.js " + process.version + "; " + os.platform() + " " + os.release() + ")";
        this.options.userAgent = userAgent;
      }
      catch (err) {
        this.options.userAgent = "node-bitspider";
      }
    }
  }

  /******************************************************************************************
   * Create a signature
   ******************************************************************************************/
  _sign(concatenated) {
    //Generate a SHA256 signature encoded as BASE64
    return require('crypto').createHash('sha256').update(concatenated).digest('base64');
  }

  /******************************************************************************************
   * Perform a HTTP request
   ******************************************************************************************/
  _request(method, route, data, options) {
    const self = this;
    return new Promise((resolve, reject) => {
      try {
        //Verify if base URL is set
        if (!self.options || !self.options.baseUrl || typeof self.options.baseUrl != "string" || self.options.baseUrl.trim().length == 0) {
          throw new Error("Base URL is required!");
        }
        
        //HTTPS scheme is required
        if (!/^https:\/\//g.test(self.options.baseUrl)) {
          throw new Error("Base URL must start with 'https' scheme!");
        }

        //Argument 'route' is required
        if (!route || typeof route != "string" || route.trim().length == 0) {
          throw new Error("Argument 'route' is required!");
        }
      
        //Build absolute URL
        let url = self.options.baseUrl;
        url = url.replace(/\/+$/g, "") + route;
        if (options && options.query) {
          url += "?" + toQueryString(options.query);
        }
        
        //Build request options
        let opt = {
          method: method,
          headers: {
            "User-Agent": self.options.userAgent,
            "Accept": "application/json"
          },
        };

        //Post data
        if (data) {
          opt.body = JSON.stringify(data);
          opt.headers["Content-Type"] = "application/json";
        }
        
        //Append API key
        if (self.options.apiKey) {
          opt.headers["Authorization"] = "Bearer" + " " + self.options.apiKey;
        }

        //Append API signature
        if (self.options.apiSecret && opt.body) {
          opt.headers["X-Api-Signature"] = self._sign(opt.body + self.options.apiSecret);
        }
        
        //Emit an event before the request
        self.emit("request", {
          url: url,
          method: opt.method,
          headers: opt.headers,
          body: data || null,
          bodyText: opt.body || null
        });
        
        let res = null;
        
        //Create and handle a HTTP request
        fetch(url, opt)
        .then(response => {
          //Emit an event on response
          self.emit("response", response);
          
          //Save for later
          res = response;
          
          //Parse response body as JSON
          return response.json();
        })
        .then(result => {
          //Emit an event after the result is being parsed
          self.emit("result", result);
          
          //Handle error status code
          if (!res || res.status >= 400) {
            let message = "" + res.status + " " + res.statusText;
            if (result && typeof result.error == "string") {
              message += ": " + result.error;
            }
            let error = new Error(message);
            error.data = result;
            throw error;
          }
          
          return resolve(result);
        })
        .catch(err => {
          self.emit("catch", err);
          return reject(err);
        });
      }
      catch (err) {
        self.emit("catch", err);
        return reject(err);
      }
    });
  }
  
  /******************************************************************************************
   * Get a list of payment requests.
   * @param {object} query Optional, query string options { skip, take }
   ******************************************************************************************/
  getPaymentRequests(query) {
    return this._request("GET", "/merchant/payment", null, { query: query });
  }
  
  /******************************************************************************************
   * Get a specific payment request by id.
   * @param {string} id Payment request id
   ******************************************************************************************/
  getPaymentRequestById(id) {
    return this._request("GET", "/merchant/payment/" + id);
  }
  
  /******************************************************************************************
   * Create a new payment request.
   * @param {object} data Payment request data
   ******************************************************************************************/
  createPaymentRequest(data) {
    return this._request("POST", "/merchant/payment", data);
  }
  
  /******************************************************************************************
   * Cancel a pending or expired payment request.
   * @param {string} id Payment request id
   ******************************************************************************************/
  cancelPaymentRequest(id) {
    return this._request("DELETE", "/merchant/payment/" + id);
  }
  
  /******************************************************************************************
   * Get a list of withdrawal requests.
   * @param {object} query Optional, query string options { skip, take }
   ******************************************************************************************/
  getWithdrawalRequests(query) {
    return this._request("GET", "/merchant/withdrawal", null, { query: query });
  }
  
  /******************************************************************************************
   * Get a specific withdrawal request by id.
   * @param {string} id Withdrawal request id
   ******************************************************************************************/
  getWithdrawalRequestById(id) {
    return this._request("GET", "/merchant/withdrawal/" + id);
  }
  
  /******************************************************************************************
   * Create a withdrawal request.
   * @param {object} data Withdrawal request data
   ******************************************************************************************/
  createWithdrawalRequest(data) {
    return this._request("POST", "/merchant/withdrawal", data);
  }
  
  /******************************************************************************************
   * Cancel a withdrawal request.
   * @param {string} id Withdrawal request id
   ******************************************************************************************/
  cancelWithdrawalRequest(id) {
    return this._request("DELETE", "/merchant/withdrawal/" + id);
  }
  
  /******************************************************************************************
   * Estimate the price in cryptocurrency.
   ******************************************************************************************/
  estimatePrice(data) {
    return this._request("POST", "/merchant/estimate", data);
  }
  
  /******************************************************************************************
   * Get user's balance.
   ******************************************************************************************/
  getBalance() {
    return this._request("GET", "/merchant/balance");
  }
  
  /******************************************************************************************
   * Get user info.
   ******************************************************************************************/
  getUserInfo() {
    return this._request("GET", "/user/me");
  }

}

module.exports = BitSpider;