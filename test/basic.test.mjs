import 'expect-puppeteer';

describe('Google', () => {
    beforeAll(async () => {
        await page.goto('https://google.com');
    });

    test('should be titled "Google"', async () => {
        await expect(page.title()).resolves.toMatch('Google');
    });
});

describe('Lightview - Variables', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:8080/test/basic.html');
    });

    test('should be titled "Basic"', async () => {
        await expect(page.title()).resolves.toMatch('Basic');
    });

    test('boolean - open should be imported', async () => {
        const result = await page.evaluate(() => {
            const el = document.getElementById("test");
            return JSON.parse(el.getVariableValue("open"));
        });
        expect(result).toBe(true);
    });

    test('number - count should be imported', async () => {
        const result = await page.evaluate(() => {
            const el = document.getElementById("test");
            return JSON.parse(el.getVariableValue("count"));
        });
        expect(result).toBe(1);
    });

    test('string - name should be imported', async () => {
        const result = await page.evaluate(() => {
            const el = document.getElementById("test");
            return el.getVariableValue("name");
        });
        expect(result).toBe("joe");
    });

    test('object - children should be imported', async () => {
        const result = await page.evaluate(() => {
            const el = document.getElementById("test");
            return el.getVariableValue("children").toJSON();
        });
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toBe("mary");
        expect(result.length).toBe(1);
    });

    test('boolean - checked should be exported', async () => {
        const result = await page.evaluate(() => {
            const el = document.getElementById("test");
            return JSON.parse(el.getAttribute("checked"));
        });
        expect(result).toBe(true);
    });

    test('number - age should be exported', async () => {
        const result = await page.evaluate(() => {
            const el = document.getElementById("test");
            return JSON.parse(el.getAttribute("age"));
        });
        expect(result).toBe(27);
    });

    test('string - color should be exported', async () => {
        const result = await page.evaluate(() => {
            const el = document.getElementById("test");
            return el.getAttribute("color");
        });
        expect(result).toBe("green");
    });

    test('object - hamburger should be exported', async () => {
        const result = await page.evaluate(() => {
            const el = document.getElementById("test");
            return JSON.parse(el.getAttribute("hamburger"));
        });
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toBe("lettuce");
        expect(result.length).toBe(1);
    });

    test('boolean - open should be rendered', async () => {
        const result = await page.evaluate(() => {
            const el = document.getElementById("test"),
                result = el.getElementById("open");
            return JSON.parse(result.innerText);
        });
        expect(result).toBe(true);
    });

    test('number - count should be rendered', async () => {
        const result = await page.evaluate(() => {
            const el = document.getElementById("test"),
                result = el.getElementById("count");
            return JSON.parse(result.innerText);
        });
        expect(result).toBe(1);
    });

    test('string - name should be rendered', async () => {
        const result = await page.evaluate(() => {
            const  el = document.getElementById("test"),
                result = el.getElementById("name");
            return result.innerText;
        });
        expect(result).toBe("joe");
    });

    test('object - children should be rendered', async () => {
        const result = await page.evaluate(() => {
            const  el = document.getElementById("test"),
                result = el.getElementById("children");
            return JSON.parse(result.innerText);
        });
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toBe("mary");
        expect(result.length).toBe(1);
    });

    test('boolean - checked should be rendered', async () => {
        const result = await page.evaluate(() => {
            const el = document.getElementById("test"),
                result = el.getElementById("checked");
            return JSON.parse(result.innerText);
        });
        expect(result).toBe(true);
    });

    test('number - age should be rendered', async () => {
        const result = await page.evaluate(() => {
            const  el = document.getElementById("test"),
                result = el.getElementById("age");
            return JSON.parse(result.innerText);
        });
        expect(result).toBe(27);
    });

    test('string - color should be rendered', async () => {
        const result = await page.evaluate(() => {
            const  el = document.getElementById("test"),
                result = el.getElementById("color");
            return result.innerText;
        });
        expect(result).toBe("green");
    });

    test('object - hamburger should be rendered', async () => {
        const result = await page.evaluate(() => {
            const el = document.getElementById("test"),
                result = el.getElementById("hamburger");
            return JSON.parse(result.innerText);
        });
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toBe("lettuce");
        expect(result.length).toBe(1);
    });

    test('shared - myshare should be same', async () => {
        const result = await page.evaluate(async () => {
            const el0 = document.getElementById("test"),
                el1 = document.getElementById("test1")
            return [el0.getVariableValue("myshare"),el1.getVariableValue("myshare")];
        });
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toBe(result[1]);
    });

    test('untyped input - iuntyped should be "test"', async () => {
        const result = await page.evaluate(async () => {
            const el = document.getElementById("test"),
                result = el.getElementById("iuntyped")
            return result.getAttribute("value");
        });
        expect(result).toBe("test");
    });


    test('text input - itext should be test', async () => {
        const result = await page.evaluate(async () => {
            const el = document.getElementById("test"),
                result = el.getElementById(`itext`);
            return result.getAttribute("value");
        });
        expect(result).toBe("test");
    });


    test('tel input - itel should be test', async () => {
        const result = await page.evaluate(async () => {
            const el = document.getElementById("test"),
                result = el.getElementById("itel");
            return result.getAttribute("value");
        });
        expect(result).toBe("test");
    });

    test('email input - email should be test', async () => {
        const result = await page.evaluate(async () => {
            const el = document.getElementById("test"),
                result = el.getElementById("iemail");
            return result.getAttribute("value");
        });
        expect(result).toBe("test");
    });

        test('url input - url should be test', async () => {
            const result = await page.evaluate(async () => {
                const el = document.getElementById("test"),
                    result = el.getElementById("iurl");
                return result.getAttribute("value");
            });
            expect(result).toBe("test");
        });

        test('search input - search should be test', async () => {
            const result = await page.evaluate(async () => {
                const el = document.getElementById("test"),
                    result = el.getElementById("isearch");
                return result.getAttribute("value");
            });
            expect(result).toBe("test");
        });

        test('radio input - radio should be test', async () => {
            const result = await page.evaluate(async () => {
                const el = document.getElementById("test"),
                    result = el.getElementById("iradio");
                return result.checked;
            });
            expect(result).toBe(true);
        });

        test('color input - color should be test', async () => {
            const result = await page.evaluate(async () => {
                const el = document.getElementById("test"),
                    result = el.getElementById("icolor");
                return result.getAttribute("value");
            });
            expect(result).toBe("test");
        });

        test('password input - password should be test', async () => {
            const result = await page.evaluate(async () => {
                const el = document.getElementById("test"),
                    result = el.getElementById("ipassword");
                return result.getAttribute("value");
            });
            expect(result).toBe("test");
        });

    test('number input - inumber should be 1', async () => {
        const result = await page.evaluate(async () => {
            const el = document.getElementById("test"),
                result = el.getElementById("inumber")
            return JSON.parse(result.getAttribute("value"));
        });
        expect(result).toBe(1);
    });

    test('range input - irange should be 1', async () => {
        const result = await page.evaluate(async () => {
            const el = document.getElementById("test"),
                result = el.getElementById("irange")
            return JSON.parse(result.getAttribute("value"));
        });
        expect(result).toBe(1);
    });

    test('datetime input - idatetime should be current date', async () => {
        const result = await page.evaluate(async () => {
            const el = document.getElementById("test"),
                result = el.getElementById("idatetime")
            return result.getAttribute("value");
        });
        const dt = new Date(result);
        expect(dt).toBeInstanceOf(Date);
        expect(dt.toString()).toBe(result);
    });

    test('checkbox input - icheckbox should be true', async () => {
        const result = await page.evaluate(async () => {
            const el = document.getElementById("test"),
                result = el.getElementById("icheckbox")
            return result.checked;
        });
        expect(result).toBe(true);
    });
});

describe("Lightview - on: directive", () => {
    test('on:<handler> - count should be bumped', async () => {
        await page.click("#test",{waitUntil:"load"});
        const result = await page.evaluate(async () => {
            const el = document.getElementById("test");
            return JSON.parse(el.getVariableValue("counter"));
        });
        expect(result).toBe(1);
    });
})

describe("Lightview - lifecycle", () => {
    test('connected should be called', async () => {
        const result = await page.evaluate(async () => {
            const el = document.getElementById("test");
            return el.testId;
        });
        expect(result).toBe("test");
    });
    test('change should be called', async () => {
        await page.click("#test",{waitUntil:"load"});
        const result = await page.evaluate(async () => {
            const el = document.getElementById("test");
            return el.counter;
        });
        expect(result).toBe(2);
    });
})