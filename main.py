import speech_recognition as sr
import pyttsx3
from fuzzywuzzy import fuzz
from num2words import num2words

def speak(text):
    print(text)

    engine = pyttsx3.init()

    voices = engine.getProperty('voices')
    try:
        engine.setProperty('voice', voices[0].id)
    except IndexError:
        engine.setProperty('voice', voices[1].id)

    engine.say(text)
    engine.runAndWait()

def command():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        try:
            print('Listening...')
            r.pause_threshold = 1
            r.adjust_for_ambient_noise(source, duration=1)
            audio = r.listen(source)
            text = r.recognize_google(audio, language='en-US').lower()
            print(f"[logs] Recognized: {text}")
            return text
        except sr.UnknownValueError:
            print("[logs] Speech is not recognized")
            return command()
        except sr.RequestError:
            print("[logs] Could not request results from Google")
            return command()

opts = {
    'name': ('jarvis', 'jarvees', 'deepseek'),
    'user_commands': ('tell', 'say', 'show', 'how', 'how many', 'search', 'me', 'please'),
    'cmds': {
        'time': ('time', 'what time', 'the time'),
    }
}

def recognize_cmd(cmd):
    RC = {'cmd': '', 'percent': 0}
    for k, v in opts['cmds'].items():
        for x in v:
            vrt = fuzz.partial_ratio(cmd, x)
            if vrt > RC['percent']:
                RC['cmd'] = k
                RC['percent'] = vrt

    return RC
# Напишем по мере урока :)