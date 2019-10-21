chrome.devtools.panels.create('TestCafe', 'img/icon.png', 'devtools-panel-testcafe.html', function(panel)
{
  console.log('custom panel is created successfully!');
});

chrome.devtools.panels.elements.createSidebarPane("Images", function(sidebar)
{
  sidebar.setExpression('document.querySelectorAll("img")', 'All Images');
});