let btn = document.querySelector("#micc");
let content = document.querySelector("#txtt");
let voice = document.querySelector("#im");

let voices = [];
let isProcessing = false;
let lastSpoken = "";
let lastTranscript = ""; // Stores last recognized text
let lastCommandTime = 0; // Stores timestamp of the last command

// Load voices function
function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
        setTimeout(loadVoices, 100);
    }
}

window.speechSynthesis.onvoiceschanged = loadVoices;
loadVoices(); // Load voices initially

function getPreferredVoice() {
    return voices.find(voice => 
        voice.name.includes("Female") || 
        voice.name.includes("Zira") || 
        voice.name.includes("Google UK English Female")) || voices[0];
}

function speak(text) {
    if (voices.length === 0) {
        console.warn("No voices available. Retrying...");
        setTimeout(() => speak(text), 1000);
        return;
    }
    const textToSpeak = new SpeechSynthesisUtterance(text);
    textToSpeak.voice = getPreferredVoice();
    window.speechSynthesis.speak(textToSpeak);
    lastSpoken = text;
    console.log("Speaking:", text); // Debugging log
}

function wishMe() {
    const hour = new Date().getHours();
    if (hour < 12) {
        speak("Good morning Kamz");
    } else if (hour < 17) {
        speak("Good afternoon Kamz");
    } else {
        speak("Good evening Kamz");
    }
}

let recognizeSpeech = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!recognizeSpeech) {
    alert("Speech Recognition not supported in this browser. Please use a compatible browser.");
} else {
    let recognize = new recognizeSpeech();
    recognize.continuous = false; // Stop after each result
    recognize.interimResults = false;

    recognize.onresult = function (event) {
        let transcript = event.results[event.resultIndex][0].transcript.trim();
        
        // Remove any trailing punctuation (like full stops)
        transcript = transcript.replace(/[.,!?;]$/, "").trim();

        const currentTime = new Date().getTime();
        if (!isProcessing && transcript !== lastTranscript && currentTime - lastCommandTime > 5000) { // 5-second cooldown
            isProcessing = true;
            lastTranscript = transcript;
            lastCommandTime = currentTime;
            console.log("Recognized:", transcript); // Debugging log
            takeCommand(transcript.toLowerCase());
            
            // Stop recognition after a single result
            recognize.stop();
        }
    };

    btn.addEventListener("click", function () {
        recognize.start();
        voice.style.display = "block";
        btn.style.display = "none";
    });

    recognize.onend = function () {
        voice.style.display = "none";
        btn.style.display = "flex";
        isProcessing = false; // Reset processing flag when recognition ends
    };
}

function takeCommand(message) {
    console.log("Processing command:", message);

    if (message.includes("hello") || message.includes("hi")) {
        speak("Hello Kamz, what's up?");
    } else if (message.includes("who are you") || message.includes("what's your name")) {
        speak("I am your Lyra here to help you!");
    } else if (message.includes("youtube") || message.includes("open youtube")) {
        speak("Opening YouTube...");
        window.open("https://youtube.com", "_blank");
    } else if (message.includes("coco melon") || message.includes("play child videos") || message.includes("open child videos")) {
        speak("Opening Coco Melon for you.");
        window.open("https://www.youtube.com/watch?v=hxOApe1P9dM", "_blank");
    } else if (message.includes("cat") || message.includes("cat video")) {
        speak("Opening a cat video for you.");
        window.open("https://www.youtube.com/watch?v=LXncdrIxIUw", "_blank");
    } else if (message.includes("say") || message.includes("repeat")) {
        let toRepeat = message.replace("say", "").replace("repeat", "").trim();
        speak(toRepeat);
    } else if (message.includes("wish me") || message.includes("greet me")) {
        wishMe(); // This should call the wishMe function
    } else {
        speak("Here is what I found on the internet.");
        window.open(`https://www.google.com/search?q=${message.replace("lyra", "").trim()}`, "_blank");
    }

    // Reset flags for next command
    isProcessing = false;
    lastTranscript = ""; // Reset to allow fresh commands
}

// Call wishMe once when the page loads
