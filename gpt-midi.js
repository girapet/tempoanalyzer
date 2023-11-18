
const ELEMENT_NAME = 'gpt-midi';

class GptMidi extends HTMLElement {
  #midi;
  #connected = false;
  #message;
  
  constructor() {
    super(); 
  }

  async connectedCallback() {
    this.style.display = 'inline';

    if (!navigator.requestMIDIAccess) {
      this.#message = 'MIDI is not supported by this browser';
    }
    else {
      try {
        this.#midi = await navigator.requestMIDIAccess();
      }
      catch {
        this.#message = 'The MIDI system failed to start';
      }
  
      if (this.#midi) {
        this.#connected = this.#connectInputs();
        this.#midi.addEventListener('statechange', (event) => { this.#handleStateChange(event); });

        if (this.#connected) {
          this.dispatchEvent(new CustomEvent('connect'));
        }
      }
    }

    this.#render();
  }

  get connected() {
    return this.#connected;
  }

  #connectInputs() {
    let connected = false;

    this.#midi.inputs.forEach((input) => {
      if (!input.onmidimessage) {
        input.onmidimessage = (event) => { this.#handleMidiEvent(event); };
      }

      connected = true;
    });

    if (!connected) {
      this.#message = 'No MIDI device available'
    }
    
    return connected;
  }

  #handleStateChange(event) {
    const wasConnected = this.#connected;
    this.#connected = this.#connectInputs();

    if (this.#connected && !wasConnected) {
      this.dispatchEvent(new CustomEvent('connect', { detail: { sourceEvent: event } }));
    }
    else if (!this.#connected && wasConnected) {
      this.dispatchEvent(new CustomEvent('disconnect', { detail: { sourceEvent: event } }));
    }

    this.#render();
  }

  #handleMidiEvent(event) {
    const midiEventType = event.data[0] >> 4;
    const detail = {};

    switch (midiEventType) {
      case 8:
      case 9:
        detail.type = midiEventType === 9 && event.data[2] > 0 ? 'noteon' : 'noteoff';
        detail.note = event.data[1];
        detail.velocity = event.data[2] ? (event.data[2] + 1) / 128 : 0;
        break;

      case 11:
        detail.type = 'control';
        detail.controller = event.data[1];
        detail.value = event.data[2] ? (event.data[2] + 1) / 128 : 0;
        break;

      case 14:
        detail.type = 'pitchbend';
        detail.value = (event.data[2] << 7 | event.data[1]) / 8192 - 1;
        break;
    }

    if (detail.type) {
      detail.channel = event.data[0] & 0xf;
      detail.timestamp = event.timeStamp;
      this.dispatchEvent(new CustomEvent(detail.type, { detail }));
    }
  }

  #render() {
    if (!this.#connected) {
      this.innerText = this.#message;
    }
    else {
      const names = Array.from(this.#midi.inputs.values()).map((input) => input.name);
      this.innerText = `Connected to ${names.join(', ')}`;
    }
  }
}

customElements.define(ELEMENT_NAME, GptMidi);

export default GptMidi;