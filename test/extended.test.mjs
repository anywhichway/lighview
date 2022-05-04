import 'expect-puppeteer';
function reviver(property,value) {
    if(value==="@-Infinity") return -Infinity;
    if(value==="@Infinity") return Infinity;
    if(value==="@NaN") return NaN;
    return value;
}

describe('Lightview - Variables', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:8080/test/extended.html');
    });

    test('should be titled "Extended"', async () => {
        await expect(page.title()).resolves.toMatch('Extended');
    });

    test('strictarray - should be array', async () => {
        const result = await page.evaluate(() => {
            return document.body.getVariableValue("strictarray")
        });
        expect(Array.isArray(result)).toBe(true);
    });

    test('strictarray - should set', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("strictarray",[]);
            } catch(e) {
                return e;
            }
            return document.body.getVariableValue("strictarray")
        });
        expect(Array.isArray(result)).toBe(true);
    });

    test('strictarray - should allow null', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("strictarray",undefined);
                document.body.setVariableValue("strictarray",null);
            } catch(e) {
                return e;
            }
            return document.body.getVariableValue("strictarray")
        });
        expect(result).toBe(null);
    });

    test('strictarray - should throw', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("strictarray","false");
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("strictarray");
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("strictarray");
        expect(validityState.typeMismatch).toBe(true);
        expect(validityState.value).toBe("false");
    });

    test('strictboolean - should be boolean', async () => {
        const result = await page.evaluate(() => {
            return document.body.getVariableValue("strictboolean")
        });
        expect(result).toBe(true);
    });

    test('strictboolean - should set', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("strictboolean",false);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("strictboolean")
        });
        expect(result).toBe(false);
    });

    test('strictboolean - should allow null', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("strictboolean",undefined);
                document.body.setVariableValue("strictboolean",null);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("strictboolean")
        });
        expect(result).toBe(null);
    });

    test('strictboolean - should throw', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("strictboolean","true");
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("strictboolean");
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("strictboolean");
        expect(validityState.typeMismatch).toBe(true);
        expect(validityState.value).toBe("true");
    });

    test('strictnumber - should be number', async () => {
        const result = await page.evaluate(() => {
            return document.body.getVariableValue("strictnumber")
        });
        expect(result).toBe(0);
    });

    test('strictnumber - should set', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("strictnumber",1);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("strictnumber")
        });
        expect(result).toBe(1);
    });

    test('strictnumber - should allow null', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("strictnumber",undefined);
                document.body.setVariableValue("strictnumber",null);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("strictnumber")
        });
        expect(result).toBe(null);
    });

    test('strictnumber - should throw', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("strictnumber","0");
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("strictnumber");
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("strictnumber");
        expect(validityState.typeMismatch).toBe(true);
        expect(validityState.value).toBe("0");
    });

    test('strictobject - should be object', async () => {
        const result = await page.evaluate(() => {
            return document.body.getVariableValue("strictobject")
        });
        expect(typeof(result)).toBe("object");
        expect(Object.keys(result).length).toBe(0);
    });

    test('strictobject - should set', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("strictobject", {test:"test"});
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("strictobject")
        });
        expect(typeof(result)).toBe("object");
        expect(Object.keys(result).length).toBe(1);
        expect(result.test).toBe("test");
    });

    test('strictobject - should allow null', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("strictobject",undefined);
                document.body.setVariableValue("strictobject",null);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("strictobject")
        });
        expect(result).toBe(null);
    });

    test('strictobject - should throw', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("strictobject","false");
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("strictobject");
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("strictobject");
        expect(validityState.typeMismatch).toBe(true);
        expect(validityState.value).toBe("false");
    });

    test('strictstring - should be string', async () => {
        const result = await page.evaluate(() => {
            return document.body.getVariableValue("strictstring")
        });
        expect(result).toBe("test");
    });

    test('strictstring - should set', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("strictstring","anothertest");
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("strictstring")
        });
        expect(result).toBe("anothertest");
    });

    test('strictstring - should allow null', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("strictstring",undefined);
                document.body.setVariableValue("strictstring",null);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("strictstring")
        });
        expect(result).toBe(null);
    });

    test('strictstring - should throw', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("strictstring",0);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("strictstring");
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("strictstring");
        expect(validityState.typeMismatch).toBe(true);
        expect(validityState.value).toBe(0);
    });

    test('extendedarray - should respect minlength', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("extendedarray",[]);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("extendedarray")
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("extendedarray");
        expect(validityState.tooShort).toBe(true);
    });

    test('extendedarray - should respect maxlength', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("extendedarray",[1,2,3,4,5]);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("extendedarray")
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("extendedarray");
        expect(validityState.tooLong).toBe(true);
    });

    test('extendedarray - should throw and not allow null', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("extendedarray",null);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("extendedarray")
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("extendedarray");
        expect(validityState.valueMissing).toBe(true);
    });

    test('extendednumber - should throw and not allow null', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("extendednumber",null);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("extendednumber")
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("extendednumber");
        expect(validityState.valueMissing).toBe(true);
    });

    test('extendednumber - should throw and not allow NaN', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("extendednumber",NaN);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("extendednumber")
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("extendednumber");
        expect(validityState.badInput).toBe(true);
        //expect(validityState.value).toBe(null);
    });

    test('extendednumber - should respect min', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("extendednumber",0);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("extendednumber")
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("extendednumber");
        expect(validityState.rangeUnderflow).toBe(true);
    });

    test('extendednumber - should allow between and allow step', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("extendednumber",4);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("extendednumber")
        });
        expect(result).toBe(4);
    });

    test('extendednumber - should respect max', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("extendednumber",5);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("extendednumber")
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("extendednumber");
        expect(validityState.rangeOverflow).toBe(true);
    });

    test('extendednumber - should respect step', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("extendednumber",3);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("extendednumber")
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("extendednumber");
        expect(validityState.rangeUnderflow).toBe(true);
    });

    test('allowNaNnumber - should allow NaN', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("allowNaNnumber",NaN);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("allowNaNnumber")
        });
        expect(typeof(result)==="number" && isNaN(result)).toBe(true);
    });

    test('noNaNnumber - should not allow NaN', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("noNaNnumber",NaN);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("noNaNnumber")
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("noNaNnumber");
        expect(validityState.badInput).toBe(true);
    });

    test('extendedstring - should respect minlength', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("extendedstring","a");
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("extendedstring")
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("extendedstring");
        expect(validityState.tooShort).toBe(true);
    });

    test('extendedstring - should respect maxlength', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("extendedstring","abcdefg");
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("extendedstring")
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("extendedstring");
        expect(validityState.tooLong).toBe(true);
    });

    test('extendedstring - should throw and not allow null', async () => {
        const result = await page.evaluate(() => {
            try {
                document.body.setVariableValue("extendedstring",null);
            } catch(e) {
                return e.message;
            }
            return document.body.getVariableValue("extendedstring")
        });
        const {name,validityState} = JSON.parse(result,reviver);
        expect(name).toBe("extendedstring");
        expect(validityState.valueMissing).toBe(true);
    });
})