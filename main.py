import urllib.parse
import webbrowser
from datetime import datetime
import speech_recognition as sr
import pyttsx3
from fuzzywuzzy import fuzz
from num2words import num2words
from ctypes import *

# Глушилка системных логов (только для Linux)
try:
    ERROR_HANDLER_FUNC = CFUNCTYPE(None, c_char_p, c_int, c_char_p, c_int, c_char_p)
    def py_error_handler(filename, line, function, err, fmt):
        pass
    c_error_handler = ERROR_HANDLER_FUNC(py_error_handler)
    asound = cdll.LoadLibrary('libasound.so.2')
    asound.snd_lib_error_set_handler(c_error_handler)
except OSError:
    pass

class VoiceAssistant:
    def __init__(self):
        self.engine = pyttsx3.init()

        voices = self.engine.getProperty('voices')
        try:
            self.engine.setProperty('voice', voices[1].id)
        except IndexError:
            self.engine.setProperty('voice', voices[0].id)

    def speak(self, text):
        print(text)
        self.engine.say(text)
        self.engine.runAndWait()

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
    'name': ('jarvis', 'jarvees', 'deep seek'),
    'user_commands': ('tell', 'say', 'show', 'how', 'how many', 'search', 'me', 'please'),
    'cmds': {
        'time': ('time', 'what time', 'the time'),
        'google': ('find', 'google'),
        'rutube': ('rutube', ),
        'youtube': ('youtube', ),
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

def youtube_search(query):
    tes = urllib.parse.quote_plus(query)
    url = f"https://www.youtube.com/results?search_query={tes}"
    webbrowser.open(url, new=1)

def rutube_search(query):
    tes = urllib.parse.quote_plus(query)
    url = f"https://rutube.ru/search/?query={tes}"
    webbrowser.open(url, new=1)

def google_search(query):
    tes = urllib.parse.quote_plus(query)
    url = f"https://www.google.com/search?q={tes}"
    webbrowser.open(url, new=1)

def exec_command(cmd_key, raw_cmd, assistant: VoiceAssistant):
    if cmd_key == 'time':
        now = datetime.now()
        hours = num2words(now.hour)
        minutes = num2words(now.minute)

        print(f"[logs] user's command: {raw_cmd}")

        assistant.speak(f"- It is {hours} hours and {minutes} minutes.")

    elif cmd_key == 'google':
        search_query = raw_cmd.replace('google', '').replace('find', '').strip()

        assistant.speak('- The google search has been opened for you.')
        google_search(search_query)

    elif cmd_key == 'rutube':
        search_query = raw_cmd.replace('rutube', '').replace('on', '')

        assistant.speak('- The Rutube search has been opened for you.')
        rutube_search(search_query)

    elif cmd_key == 'youtube':
        search_query = raw_cmd.replace('youtube', '').replace('on', '')

        assistant.speak('- The youtube search has been opened for you.')
        youtube_search(search_query)
    else:
        print("Not recognized! Repeat, please.")

if __name__ == '__main__':
    assistant = VoiceAssistant()

    assistant.speak("- Hello! I am ready.")
    while True:
        user_input = command()

        if user_input.startswith(opts['name']):
            raw_cmd = user_input

            for i in opts['name']:
                raw_cmd = raw_cmd.replace(i, '', 1).strip()

            for i in opts['user_commands']:
                raw_cmd = raw_cmd.replace(i, '').strip()

            cmd_res = recognize_cmd(raw_cmd)
            exec_command(cmd_res['cmd'], raw_cmd, assistant)

# Остальное напишем по мере урока :)