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

describe('BitSpider authentication token', function() {

  it('should report error on missing credentials', async function() {
    try {
      //Create a new instance
      let bitspider = new BitSpider({ });
      
      //Test API key by resolving user info
      let user = await bitspider.getUserInfo();
      assert(false, "Expected error due to missing credentials!");
    }
    catch (err) {
      assert(typeof err == "object" && err, "Expected error object");
      assert(typeof err.data == "object" && err.data, "Expected data object");
      assert(err.data.code == 401, "Expected HTTP status code 401");
    }
  });

  it('should report error on incorrect credentials', async function() {
    try {
      //Create a new instance
      let bitspider = new BitSpider({
        apiKey: "this_key_does_not_exist",
        apiSecret: "this_are_not_the_droids_you_are_looking_for"
      });
      
      //Test API key by resolving user info
      let user = await bitspider.getUserInfo();
      assert(false, "Expected error due to incorrect credentials!");
    }
    catch (err) {
      assert(typeof err == "object" && err, "Expected error object");
      assert(typeof err.data == "object" && err.data, "Expected data object");
      assert(err.data.code == 401, "Expected HTTP status code 401");
    }
  });

  it('should resolve user info', async function() {
    try {
      //Required  
      if (!apiKey) {
        throw new Error("Please set API_KEY as environmental variable!");
      }
      
      //Required
      if (!apiSecret) {
        throw new Error("Please set API_SECRET as environmental variable!");
      }
      
      //Create a new instance
      let bitspider = new BitSpider({
        apiKey: apiKey,
        apiSecret: apiSecret,
      });
      
      //Test API key by resolving user info
      let user = await bitspider.getUserInfo();
      if (verbose) {
        console.log(user);
      }
      assert(typeof user == "object", "Expected object");
      assert(typeof user.id == "string", "Expected 'id' as string");
    }
    catch (err) {
      if (verbose) {
        console.error(err);
      }
      assert(false, err.message);
    }
  });
  
});
