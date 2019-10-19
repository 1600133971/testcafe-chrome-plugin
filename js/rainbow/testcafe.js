/**
 * testcafe language patterns
 *
 * @author 1600133971
 */
Rainbow.extend('testcafe', [
  {
      matches: {
          1: [
              {
                  name: 'keyword.operator',
                  pattern: /\=|\+/g
              },
              {
                  name: 'keyword.dot',
                  pattern: /\./g
              }
          ],
          2: {
              name: 'string',
              matches: {
                  name: 'constant.character.escape',
                  pattern: /\\('|"|`){1}/g
              }
          }
      },
      pattern: /(\(|\s|\[|\=|:|\+|\.|\{|,)(('|"|`)([^\\\1]|\\.)*?(\3))/gm
  },
  {
      name: 'comment',
      pattern: /\/\*[\s\S]*?\*\/|(\/\/|\#)(?!.*('|"|`).*?[^:](\/\/|\#)).*?$/gm
  },
  {
      name: 'testcafe.keyword',
      pattern: /\b(fixture|await|async|t|test|Selector|ClientFunction)\b/g
  },
  {
      matches: {
          1: 'testcafe.property'
      },
      pattern: /\.(page|childElementCount|childNodeCount|hasChildElements|hasChildNodes|nodeType|textContent|attributes|boundingClientRect|checked|classNames|clientHeight|clientLeft|clientTop|clientWidth|focused|id|innerText|namespaceURI|offsetHeight|offsetLeft|offsetTop|offsetWidth|selected|selectedIndex|scrollHeight|scrollLeft|scrollTop|scrollWidth|style|tagName|value|visible|exists|count|location|href)\b/g
  },
  {
      matches: {
          1: 'testcafe.function'
      },
      pattern: /(toString)(?=\()/g
  },
  {
      matches: {
          1: 'testcafe.action'
      },
      pattern: /\.(click|doubleClick|rightClick|drag|hover|selectText|typeText|pressKey|navigateTo|takeScreenshot|setFilesToUpload|clearUpload|resizeWindow|resizeWindowToFitDevice|maximizeWindow|wait)(?=\()/g
  },
  {
      matches: {
          1: 'testcafe.method'
      },
      pattern: /\.(find|withExactText|hasClass|getStyleProperty|getAttribute|getBoundingClientRectProperty|hasAttribute)(?=\()/g
  },
  {
      matches: {
          1: 'testcafe.assertion'
      },
      pattern: /\.(expect)(?=\()/g
  },
  {
      matches: {
          1: 'testcafe.assertion.judge'
      },
      pattern: /\.(eql|notEql|ok|notOk|contains|notContains|typeOf|notTypeOf|gt|gte|lt|lte|within|notWithin|match|notMatch)(?=\()/g
  },
  {
      matches: {
          1: 'testcafe.window'
      },
      pattern: /\.(setNativeDialogHandler|getNativeDialogHistory|switchToIframe|switchToMainWindow)(?=\()/g
  },
  {
      matches: {
          1: 'testcafe.debug'
      },
      pattern: /\.(debug|getBrowserConsoleMessages|setTestSpeed|setPageLoadTimeout)(?=\()/g
  }
], 'javascript');

Rainbow.addAlias('js', 'testcafe');
