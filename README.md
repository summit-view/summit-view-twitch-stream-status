# summit-view-twitch-stream-status
Twitch-panel for Summit View

## Usage

```
var summit = require('summit-view');
var Twitch = require('summit-view-twitch-stream-status');

summit.listen(3000);

summit.panels([
    Twitch,
]);
```