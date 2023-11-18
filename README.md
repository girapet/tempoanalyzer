## Tempo Analyzer

Calculates from a stream of repeated key presses (MIDI note-on events) on a musical keyboard:

* Average beats per minute (BPM)
* Standard and greatest deviations from the average BPM in milliseconds
* Average key pressure in the range of 0 to 100
* Standard and greatest deviations from the average key pressure

Run it at https://girapet.github.io/tempoanalyzer/index.html

### Features

* Statistics generated at each beat over the previous 12 key presses
* Groups multiple concurrent key presses, such as chords or the right and left hand playing together, into single key press events
* Resets if no keys are pressed within four seconds

### Use

* Plug a MIDI keyboard into your device.  The MIDI keyboard name will appear when connected.
* Select the number of key presses per beat (1, 2, 3, 4, or 6)
* Play repeated notes on the keyboard

### Limitations

* Will work only in later versions of Chrome or Edge
* Rhythm must be constant and consistent.  Does not understand rests or syncopation.  Only useful for exercises.