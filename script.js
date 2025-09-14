// Web Speech APIの対応状況を確認
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// 認識結果を表示する要素と動画の要素を取得
const messageElement = document.getElementById('message');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const videoContainer = document.getElementById('video-container');
const kuchiyakusokuVideo = document.getElementById('kuchiyakusoku-video');

// テキスト入力関連の要素を取得
const textInput = document.getElementById('textInput');
const textSubmit = document.getElementById('textSubmit');

// ブラウザがAPIに対応していない場合はエラーを表示
if (!SpeechRecognition) {
    messageElement.textContent = 'お使いのブラウザはWeb Speech APIに対応していません。Google Chromeなどの対応ブラウザをお使いください。';
    startButton.disabled = true;
    stopButton.disabled = true;
} else {
    // SpeechRecognitionオブジェクトを作成
    const recognition = new SpeechRecognition();

    // 言語を日本語に設定
    recognition.lang = 'ja-JP';

    // 継続的に認識を行う設定
    recognition.continuous = true;

    // 途中結果を取得する設定
    recognition.interimResults = true;

    // 認識中かどうかを管理するフラグ
    let isRecognizing = false;

    // 口約束の処理を共通化するための関数
    const processKeyword = (text) => {
        if (text.includes('口約束')) {
            messageElement.textContent = '口約束ライブ9/28';
            
            videoContainer.classList.remove('hidden');
            kuchiyakusokuVideo.play();
            
            if (isRecognizing) {
                recognition.stop();
            }
            return true;
        }
        return false;
    };

    // 音声認識が開始したときのイベント
    recognition.onstart = () => {
        isRecognizing = true;
        messageElement.textContent = '音声認識を開始しました。「口約束」と話しかけてください。';
        startButton.disabled = true;
        stopButton.disabled = false;
    };

    // 音声認識が終了したときのイベント
    recognition.onend = () => {
        isRecognizing = false;
        // ユーザーが手動で停止した場合以外は、自動で再起動
        if (!stopButton.disabled && kuchiyakusokuVideo.paused) {
            recognition.start();
        } else {
            messageElement.textContent = '音声認識が停止しました。';
            startButton.disabled = false;
            stopButton.disabled = true;
        }
    };

    // 音声認識エラーが発生したときのイベント
    recognition.onerror = (event) => {
        console.error('音声認識エラー:', event.error);
        isRecognizing = false;
        messageElement.textContent = `音声認識中にエラーが発生しました: ${event.error}`;
        startButton.disabled = false;
        stopButton.disabled = true;
    };

    // 音声認識の結果が返されたときのイベント
    recognition.onresult = (event) => {
        // 結果が空でないことを確認
        if (!event.results || event.results.length === 0) {
            return;
        }

        let transcript = '';
        // 取得した結果をすべて結合する
        for (const result of event.results) {
            transcript += result.transcript;
        }

        // キーワード処理
        if (!processKeyword(transcript)) {
            messageElement.textContent = `認識された言葉: ${transcript}`;
        }
    };
    
    // 動画の再生が終了したときのイベント
    kuchiyakusokuVideo.onended = () => {
        // 動画コンテナを非表示に戻す
        videoContainer.classList.add('hidden');
        // 音声認識を再開する
        recognition.start();
    };

    // ボタンのクリックイベント
    startButton.addEventListener('click', () => {
        // 認識中でなければ開始
        if (!isRecognizing) {
            recognition.start();
        }
    });

    stopButton.addEventListener('click', () => {
        recognition.stop();
    });

    // テキスト入力の送信ボタンがクリックされたときのイベント
    textSubmit.addEventListener('click', () => {
        const text = textInput.value;
        if (text) { // 入力欄が空でないことを確認
            if (!processKeyword(text)) {
                messageElement.textContent = `入力された言葉: ${text}`;
            }
            textInput.value = ''; // 入力欄をクリア
        }
    });

    // テキスト入力欄でEnterキーが押されたときのイベント
    textInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Enterキーによるフォーム送信を防止
            textSubmit.click(); // 送信ボタンをクリックする
        }
    });
}
