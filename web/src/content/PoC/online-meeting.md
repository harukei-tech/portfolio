---
title: 自作オンラインMTGサービス
description: 多機能化を目指したオンラインMTGツールのPoC
pubDate: 2020-07-04
tech: [PHP, Laravel, Amazon Chime]
repo: https://github.com/harukei-tech/amazon_chime
---

ToC向けのオンラインMTGにおいて、ファイルの受け渡しをしたいという要望があった。

既存のオンラインMTGツールでは実現が難しかったため
Amazon Chimeをベースに映像・チャットを実装しつつ
ファイルアップロードを組み込んだ自家製オンラインMTGツールのPoC作成のたたき台である。

これら追加機能の実装検証は会社のリポジトリで行ったため、ここにあるのはPoCのPoCである。

## Code

```php
namespace App\Http\Controllers;

use Aws\Chime\ChimeClient;
use Illuminate\Http\Request;

class ChatController extends Controller
{

    public function index(Request $request)
    {
        $options = [
            'version'     => 'latest',
            'region'      => 'ap-northeast-1',
        ];
        $client = new ChimeClient($options);

        // ミーティングルームを検索
        $result = $client->listMeetings([]);
        if (count($result['Meetings']) == 0) {
            // ない場合は作成
            $options = [
                'ClientRequestToken' => date('Ymd_His') . '_myapp_' . uniqid(),
                'MediaRegion' => 'ap-northeast-1',
            ];
            $result = $client->createMeeting($options);
            $meeting = $result['Meeting'];
        } else {
            $meeting = $result['Meetings'][0];
        }

        // ミーティングに参加
        $options = [
            'ExternalUserId' => date('Ymd_His') . '_attendee0_' . uniqid(),
            'MeetingId' => $meeting['MeetingId'],
        ];
        $result = $client->createAttendee($options);
        $attendee = $result['Attendee'];


        return view('chat.index', compact(['attendee', 'result', 'meeting']));
    }
}
```

```php
<!DOCTYPE html>
<head>
    <script src="{{asset('/js/app.js')}}"></script>
    <script>
        (async () => {
            const logger = new ChimeSDK.ConsoleLogger('MyLogger', ChimeSDK.LogLevel.ERROR);
            const deviceController = new ChimeSDK.DefaultDeviceController(logger);

            const meetingResponse = {"Meeting":<?php echo json_encode($meeting) ?>};
            const attendeeResponse = {"Attendee":<?php echo json_encode($attendee) ?>};

            const configuration = new ChimeSDK.MeetingSessionConfiguration(meetingResponse, attendeeResponse);
            const meetingSession = new ChimeSDK.DefaultMeetingSession(configuration, logger, deviceController);

            const audioInputDevices = await meetingSession.audioVideo.listAudioInputDevices();
            const audioOutputDevices = await meetingSession.audioVideo.listAudioOutputDevices();
            const videoInputDevices = await meetingSession.audioVideo.listVideoInputDevices();

            meetingSession.audioVideo.chooseVideoInputQuality(1280,720,3,1000);
            await meetingSession.audioVideo.chooseVideoInputDevice(videoInputDevices[0].deviceId);
            await meetingSession.audioVideo.chooseAudioInputDevice(audioInputDevices[0].deviceId);
            if (audioOutputDevices[0]) {
                await meetingSession.audioVideo.chooseAudioOutputDevice(audioOutputDevices[0].deviceId);
            }

            const audioElement = document.getElementById('audio-preview');
            meetingSession.audioVideo.bindAudioElement(audioElement);

            const videoElement = document.getElementById('video-preview');

            const observer = {
                audioVideoDidStart: () => {
                    console.log('Started');
                },
                videoTileDidUpdate: tileState => {
                    if (!tileState.boundAttendeeId || tileState.localTile || tileState.isContent) {
                        return;
                    }

                    console.log('Start video');
                    meetingSession.audioVideo.bindVideoElement(tileState.tileId, videoElement);
                }
            };

            meetingSession.audioVideo.addObserver(observer);
            meetingSession.audioVideo.start();
            meetingSession.audioVideo.startLocalVideoTile();
        }) ();
    </script>
</head>
<body>
<div>
    video test<br>
    <?php echo $meeting['MeetingId'] ?><br>
    <?php echo $attendee['AttendeeId'] ?>
</div>
<video id="video-preview" style="width:100%; height: 500px"></video>
<audio id="audio-preview"></audio>
</body>
</html>
```

```js
window._ = require('lodash');
window.axios = require('axios');
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.ChimeSDK = require('amazon-chime-sdk-js');
```

## ポイント

### ブラウザベース
ToC向けであったため、<br/>Electron等のデスクトップアプリにはせずブラウザベースにして開発。

URLとパスワードのみの、特殊な操作不要でMTGに参加可能なようハードルの低さを重視した。

### 高速レスポンス

AmazonChimeの通信の他、<br/>自社サーバとwebsocketの通信を張っているため、ファイルアップロードや発言意思の表示のため「自分を強調する」といったコマンドを即時反映する機能を実装した。

特にそのようなアクションは、現在でこそTeams等に「手を挙げる」といった機能があるが、<br/>当時は珍しくオリジナリティのあるアイディアであった。