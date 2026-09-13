#!/usr/bin/env python3
"""Offline three-rotor Enigma simulator. Python 3; no extra packages.

Run: python3 enigma.py
Uses rotors I-V and reflector B. Settings are entered left to right.
Only ASCII letters are processed; spaces/punctuation are discarded.
Reset to the SAME starting settings to decrypt. Educational, not secure.
Wiring: https://www.cryptomuseum.com/crypto/enigma/wiring.htm
Mechanism: https://www.cryptomuseum.com/crypto/enigma/working.htm
"""

ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
ROTORS = {
    'I': ('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q'),
    'II': ('AJDKSIRUXBLHWTMCQGZNPYFVOE', 'E'),
    'III': ('BDFHJLCPRTXVZNYEIWGAKMUSQO', 'V'),
    'IV': ('ESOVPZJAYQUIRHXLNFTGKDCMWB', 'J'),
    'V': ('VZBRGITYUPSDNHLXAWMJQOFECK', 'Z'),
}
REFLECTOR = 'YRUHQSLDPXNGOKMIEBFZCWVJAT'


def three_letters(value, label):
    value = value.strip().upper()
    if len(value) != 3 or any(c not in ALPHABET for c in value):
        raise ValueError(label + ' must contain exactly three letters A-Z.')
    return [ALPHABET.index(c) for c in value]


class Rotor:
    def __init__(self, name, position, ring):
        wiring, notch = ROTORS[name]
        self.forward = [ALPHABET.index(c) for c in wiring]
        self.backward = [self.forward.index(i) for i in range(26)]
        self.notch = ALPHABET.index(notch)
        self.position = position
        self.ring = ring

    def step(self):
        self.position = (self.position + 1) % 26

    def translate(self, letter, reverse=False):
        # Ring setting offsets the wiring relative to the window letter.
        offset = self.position - self.ring
        wiring = self.backward if reverse else self.forward
        return (wiring[(letter + offset) % 26] - offset) % 26


class Enigma:
    def __init__(self, order=('I', 'II', 'III'), positions='AAA',
                 rings='AAA', plugboard=''):
        if len(order) != 3 or len(set(order)) != 3 or any(r not in ROTORS for r in order):
            raise ValueError('Choose three different rotors from I II III IV V.')
        positions = three_letters(positions, 'Starting positions')
        rings = three_letters(rings, 'Ring settings')
        self.rotors = [Rotor(n, p, r) for n, p, r in zip(order, positions, rings)]
        self.plugs = list(range(26))
        used = set()
        for pair in plugboard.upper().split():
            if (len(pair) != 2 or any(c not in ALPHABET for c in pair)
                    or pair[0] == pair[1] or any(c in used for c in pair)):
                raise ValueError('Use distinct plugboard pairs, e.g. AB CD EF; no repeated letters.')
            a, b = [ALPHABET.index(c) for c in pair]
            self.plugs[a], self.plugs[b] = b, a
            used.update(pair)

    def step(self):
        left, middle, right = self.rotors
        # Check notches BEFORE moving. This reproduces double stepping.
        middle_at_notch = middle.position == middle.notch
        right_at_notch = right.position == right.notch
        if middle_at_notch:
            left.step()
        if middle_at_notch or right_at_notch:
            middle.step()
        right.step()

    def process(self, message):
        output = []
        for char in message:
            if char not in ALPHABET + ALPHABET.lower():
                continue
            self.step()
            signal = self.plugs[ALPHABET.index(char.upper())]
            for rotor in reversed(self.rotors):
                signal = rotor.translate(signal)
            signal = ALPHABET.index(REFLECTOR[signal])
            for rotor in self.rotors:
                signal = rotor.translate(signal, reverse=True)
            output.append(ALPHABET[self.plugs[signal]])
        return ''.join(output)

    def windows(self):
        return ''.join(ALPHABET[r.position] for r in self.rotors)


def main():
    print('\nENIGMA — encrypt and decrypt with the same starting settings')
    print('Educational simulator; not suitable for protecting real secrets.')
    print('Reflector B. Settings run LEFT to RIGHT. Rings: A=01, B=02, etc.')
    print('Spaces, numbers and punctuation are removed. Ctrl+C exits.\n')
    while True:
        try:
            order = (input('Rotors [I II III]: ').strip().upper() or 'I II III').split()
            positions = input('Starting positions [AAA]: ').strip() or 'AAA'
            rings = input('Ring settings [AAA]: ').strip() or 'AAA'
            plugs = input('Plugboard pairs [none], e.g. AB CD: ').strip()
            machine = Enigma(order, positions, rings, plugs)
            message = input('Message to encrypt OR decrypt: ')
            result = machine.process(message)
            print('\nResult:', result or '(no letters entered)')
            print('Final rotor windows:', machine.windows())
            print('To decrypt, start again with the ORIGINAL settings.\n')
            if input('Another message? [y/N]: ').strip().lower() != 'y':
                break
        except ValueError as error:
            print('\nSetting error:', error, '\nPlease enter the settings again.\n')


if __name__ == '__main__':
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        print('\nGoodbye.')


def prepare(text):
    """Teaching convention: transliterate German letters; full stops become X."""
    text = text.upper().replace('Ä', 'AE').replace('Ö', 'OE').replace('Ü', 'UE').replace('ẞ', 'SS').replace('.', 'X')
    return ''.join(c for c in text if c in ALPHABET)
