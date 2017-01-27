"use strict";
let By = require('selenium-webdriver').By;
let until = require('selenium-webdriver').until;
let keys = require("selenium-webdriver").Key;
let webdriver = require('selenium-webdriver');
let async = require("async");

class actionDriver {

    /*
     * If a driver is not passed along, the constructor will create a new browser
     * window. If your program is creating multiple browser windows unintentional-
     * ly, check that only one driver is passed along throughout.
     *
     */
    constructor(driver, config) {
        
        if (!config) {
            config = {}
        }

        let _config = config || {}
        _config.browser = config.browser || "chrome";
        _config.server = config.seleniumServer || "http://127.0.0.1:4444/wd/hub";

        this.driver = driver || new webdriver.Builder()
            .usingServer(_config.server)
            .forBrowser(_config.browser)
            .build();
        this.actions = [];
        this.defaultTimeout = 10000;
        this.error = this.defaultError;
    }

    defaultError(e) {
        console.log(e);
        return;
    }

    buildDriver() {
        this.driver.build();
    }

    /*
     * Set the function that is invoked on Selenium errors.
     */
    setErrorFunc(errFunc) {
        this.error = errFunc;
        return;
    }

    /*
     * Concatenates the actions of two different actionDrivers.
     */
    concat(otherDriver) {
        this.actions = this.actions.concat(otherDriver.actions);
        return;
    }

    /*
     * Executes the actions in this driver.
     * cb is invoked finally.
     */
    run(cb) {
        async.series(this.actions, cb);
        return this;
    }

    /*
     * Go to url.
     */
    goTo(url) {
        this.actions.push((next) => {
            this.driver.get(url)
                .then(next, this.error);
        });
        return this;
    }

    /*
     * Sleep for 'duration' milliseconds.
     */
    sleep(duration) {
        this.actions.push((next) => {
            setTimeout(next, duration);
        });
        return this;
    }

    /*
     * Click on element located by 'xpath'
     */
    click(xpath, timeout) {
        this.actions.push((next) => {
            this.driver.wait(until.elementLocated(By.xpath(xpath)), timeout || this.defaultTimeout)
                .then((elem) => {
                elem.click().then(next, this.error);
            }, this.error);
        });
        return this;
    }

    /*
     * Click on the provided WebElement. Be careful that the element does not
     * become stale(On AJAX and refreshes).
     */
    clickElem(elem, timeout) {
        this.actions.push((next) => {
            elem.click().then(next, this.error);
        });
        return this;
    }

    /*
     * Send 'sendStr' to element located by 'xpath'.
     */
    sendKeys(xpath, sendStr, timeout) {
        this.actions.push((next) => {
            this.driver.wait(until.elementLocated(By.xpath(xpath)), timeout || this.defaultTimeout)
                .then((elem) => {
                elem.sendKeys(sendStr).then(next, this.error);
            }, this.error);
        });
        return this;
    }


    /*
     * Find all elements located by 'xpath'. The elements are returned as cb's
     * first parameter. cb's second parameter should be called when done.
       * It will go to next action in the run.
     */
    getAllElements(xpath, allowSkip, cb, timeout) {
        this.actions.push((next) => {
            this.driver.wait(until.elementsLocated(By.xpath(xpath)), timeout || this.defaultTimeout)
                .then((elems) => {
                cb(elems, next);
            }, (e) => {
                if (allowSkip) {
                    cb(null, next);
                }
                else {
                    this.error(e);
                }
            });
        });
        return this;
    }

    /*
     * Get the text from an element and its sub-elements. The result is
     * concatenated
     */
    getText(xpath, cb, timeout) {
        this.actions.push((next) => {
            this.driver.wait(until.elementLocated(By.xpath(xpath)), timeout || this.defaultTimeout)
                .then((elem) => {
                elem.getText().then((text) => {
                    cb(text, next);
                }, this.error);
            }, this.error);
        });
        return this;
    }

    /*
     * See getText(..).
     */
    getTextFromElem(elem, cb, timeout) {
        this.actions.push((next) => {
            elem.getText().then((text) => {
                cb(text, next);
            });
        });
        return this;
    }

    waitFor(xpath, timeout) {
        this.actions.push((next) => {
            this.driver.wait(until.elementLocated(By.xpath(xpath)), timeout || this.defaultTimeout)
                .then((elem) => {
                next();
            }, this.error);
        });
        return this;
    }


    /*
     * Add a completely custom action to the action list.
     * The provided action must take a callback function as input.
     */
    custom(func) {
        this.actions.push((next) => {
            func(this.driver,next);
        });
        return this.driver;
    }
}
module.exports = actionDriver;
//# sourceMappingURL=driver.js.map