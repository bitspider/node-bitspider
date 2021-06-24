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

const fs = require('fs');
const url = require('url');
const path = require('path');
const assert = require('assert');

const { BitSpider } = require('../index.js');

const verbose = process.env.VERBOSE == 1;
const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

let bitspider;
let paymentRequestId;
let withdrawalRequestId;

describe('BitSpider REST API', function() {

  before(function() {
    //Required parameter
    if (!apiKey) {
      throw new Error("Please set API_KEY as environmental variable!");
    }
    
    //Required parameter
    if (!apiSecret) {
      throw new Error("Please set API_SECRET as environmental variable!");
    }
    
    //Create a new instance
    bitspider = new BitSpider({
      apiKey: apiKey,
      apiSecret: apiSecret,
    });

    //Verbose mode prints to the console
    if (verbose) {
      bitspider.on("request", function(req) {
        console.log("request", req);
      });
      bitspider.on("response", function(res) {
        console.log("response", res.status, res.statusText);
      });
      bitspider.on("result", function(data) {
        console.log("result", data);
      });
      bitspider.on("catch", function(err) {
        console.error("catch", err);
      });
    }
  });
  
  it('should create a new payment request', async function() {
    this.timeout(30 * 1000);

    let data = {
      "requestedCurrency": "EUR",
      "requestedAmount": 120.0,
      "intermediateCurrency": "BTC"
    };
    let result = await bitspider.createPaymentRequest(data);
    assert(typeof result == "object", "Expected object");

    paymentRequestId = result.id;
  });

  it('should get a list of payment requests', async function() {
    let result = await bitspider.getPaymentRequests({ skip: 0, take: 100 });
    assert(typeof result == "object", "Expected object");
    assert(result.items instanceof Array, "Expected 'items' as array");
    assert(result.items.length > 0, "Expected at least one payment request");
  });

  it('should get a payment request by id', async function() {
    this.timeout(30 * 1000);

    let id = paymentRequestId;
    assert(typeof id == "string", "Expected 'id' as string");
    assert(id.length > 0, "Expected 'id' to be non-empty string");

    let result = await bitspider.getPaymentRequestById(id);
    assert(typeof result == "object", "Expected object");
  });

  it('should cancel a pending or expired payment request', async function() {
    let id = paymentRequestId;
    assert(typeof id == "string", "Expected 'id' as string");
    assert(id.length > 0, "Expected 'id' to be non-empty string");
    
    let result = await bitspider.cancelPaymentRequest(id);
    assert(typeof result == "object", "Expected object");
  });

  it('should create a new withdrawal request', async function() {
    this.timeout(30 * 1000);

    let data = {
      "amount": 50.0,
      "currency": "EUR"
    };
    let result = await bitspider.createWithdrawalRequest(data);
    assert(typeof result == "object", "Expected object");

    withdrawalRequestId = result.id;
  });

  it('should get a list of withdrawal requests', async function() {
    let result = await bitspider.getWithdrawalRequests({ skip: 0, take: 100 });
    assert(typeof result == "object", "Expected object");
    assert(result.items instanceof Array, "Expected 'items' as array");
    assert(result.items.length > 0, "Expected at least one withdrawal request");
  });

  it('should get a withdrawal request by id', async function() {
    this.timeout(30 * 1000);

    let id = withdrawalRequestId;
    assert(typeof id == "string", "Expected 'id' as string");
    assert(id.length > 0, "Expected 'id' to be non-empty string");

    let result = await bitspider.getWithdrawalRequestById(id);
    assert(typeof result == "object", "Expected object");
  });

  it('should cancel a pending or expired withdrawal request', async function() {
    let id = withdrawalRequestId;
    assert(typeof id == "string", "Expected 'id' as string");
    assert(id.length > 0, "Expected 'id' to be non-empty string");
    
    let result = await bitspider.cancelWithdrawalRequest(id);
    assert(typeof result == "object", "Expected object");
  });

  it('should estimate exchange amount', async function() {
    this.timeout(30 * 1000);

    let data = {
      "requestedCurrency": "EUR",
      "requestedAmount": 120.0,
      "intermediateCurrency": "BTC"
    };
    let result = await bitspider.estimatePrice(data);
    assert(typeof result == "object", "Expected object");
    assert(typeof result.intermediateAmount != "undefined", "Expected intermediate amount");
    assert(result.intermediateAmount > 0, "Expected intermediate amount to be greater than zero");
  });

  it('should get user\'s balance', async function() {
    let result = await bitspider.getBalance();
    assert(typeof result == "object", "Expected object");
    assert(typeof result.balance != "undefined", "Expected 'balance' to be set");
    //assert(typeof result.pending == "string", "Expected 'pending' as string");
    assert(typeof result.currency == "string", "Expected 'currency' as string");
  });

  it('should get user info', async function() {
    let result = await bitspider.getUserInfo();
    assert(typeof result == "object", "Expected object");
    assert(typeof result.id == "string", "Expected 'id' as string");
    assert(typeof result.email == "string", "Expected 'email' as string");
    assert(typeof result.registered == "string", "Expected 'registered' as string");
  });
  
});
