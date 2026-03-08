export const componentInfo = {
  "LQFP-64_10x10mm_P05mm": {
    title: "STM32F072 MCU",
    why: "Main processor with native USB Full Speed, 48MHz Cortex-M0, and extensive peripheral support.",
    design: "Placed centrally to minimize trace lengths to all peripherals."
  },

  "C_0603_1608Metric": {
    title: "0603 Capacitor",
    why: "Decoupling and bypass capacitor. Filters power supply noise at IC power pins.",
    design: "Placed within 2mm of VDD pins for effective high-frequency noise suppression."
  },

  "SOT-23-5": {
    title: "Voltage Regulator",
    why: "LDO regulator stepping 3V input down to 1.9V for PMW3389 sensor.",
    design: "Output cap placed immediately adjacent for loop stability."
  },

  "USB_C_Receptacle": {
    title: "USB-C Receptacle",
    why: "Reversible USB 2.0 connector for data and 5V power input.",
    design: "Edge-mounted for direct cable access; CC pins pulled down for device mode."
  },

  "Microswitch_Left": {
    title: "Microswitch (Left)",
    why: "Primary left-click switch. Low actuation force for rapid input.",
    design: "Positioned under index finger for ergonomic, comfortable clicking."
  },

  "Microswitch_Right": {
    title: "Microswitch (Right)",
    why: "Primary right-click switch. Matches left switch for consistent feel.",
    design: "Positioned under ring finger, mirrored from left switch placement."
  },

  "PMW3389_Sensor": {
    title: "PMW3389 Optical Sensor",
    why: "High-end gaming sensor, up to 16,000 DPI with near-zero smoothing or acceleration.",
    design: "Centered under palm; lens height critically tuned for optimal tracking surface."
  },

  "Encoder": {
    title: "Rotary Encoder",
    why: "EC11 encoder for scroll wheel input with tactile detents per step.",
    design: "Horizontally mounted; quadrature output decoded in firmware for scroll direction."
  },

  "Arduino_Nano": {
    title: "Arduino Nano",
    why: "ATmega328P board for secondary PCB logic, prototyping, and I/O control.",
    design: "Pin-header mounted for removability; oriented to keep USB port accessible."
  },

  "Relay": {
    title: "Relay",
    why: "Electromechanical SPDT relay switching high-current loads from low-power MCU signals.",
    design: "Flyback diode placed across coil to suppress inductive voltage spikes."
  },

  "PinHeader_1x05_P254mm_Vertical": {
    title: "5-Pin Header",
    why: "Connector for STM32F072 MCU",
    design: "Edge-placed for easy MCU cable routing without crossing other traces."
  },

  "SOT-223": {
    title: "SOT-223 Regulator",
    why: "Higher-current LDO in heat-dissipating package for power-hungry sub-circuits.",
    design: "Tab pin soldered to copper pour for improved thermal dissipation."
  },

  "SW_SPDT_PCM12": {
    title: "SPDT Slide Switch",
    why: "Toggles between two circuit states, used for mode or power selection.",
    design: "Edge-mounted for easy user access, away from other components."
  },

  "SW_PUSH_6mm_H43mm": {
    title: "6mm Tactile Switch",
    why: "Momentary push button for reset, pairing, or user-defined input.",
    design: "Through-hole mounted; height chosen to protrude slightly above PCB surface."
  },

  "R_0603_1608Metric": {
    title: "0603 Resistor",
    why: "General-purpose SMD resistor for current limiting, pull-ups, and voltage dividers.",
    design: "Placed close to associated IC pins to minimize inductance and improve signal integrity."
  },

  "R_LDR_51x43mm_P34mm_Vertical": {
    title: "Light Dependent Resistor",
    why: "Photoresistor whose resistance drops with light — used for ambient light sensing.",
    design: "Vertically mounted, oriented toward opening in enclosure for light exposure."
  },

  "R_Axial_DIN0207_L63mm_D25mm_P1016mm_Horizontal": {
    title: "Axial Resistor",
    why: "Through-hole resistor for higher-power or high-precision applications where SMD isn't ideal.",
    design: "Horizontal lay for low profile; critical for current limiting on power rails."
  },

  "TO-92L_Inline": {
    title: "NPN Transistor",
    why: "Small-signal transistor used to drive relay coil or switch loads from MCU GPIO.",
    design: "Base resistor placed immediately adjacent; oriented for short collector trace to load."
  },

  "D_DO-41_SOD81_P1016mm_Horizontal": {
    title: "Diode (Horizontal)",
    why: "Rectifier or flyback diode for protecting MCU from reverse voltage or inductive kickback.",
    design: "Horizontal through-hole mount; cathode banded end clearly marked on silkscreen."
  },

  "D_DO-41_SOD81_P1016mm": {
    title: "Diode (Vertical)",
    why: "Same function as horizontal variant, used where board space requires a smaller footprint.",
    design: "Vertically mounted to save space; ensure correct polarity before soldering."
  },

  "PinHeader_1x02_P254mm_Vertical": {
    title: "2-Pin Header",
    why: "Simple 2-pin connector for power input, LED, or inter-board signal connections.",
    design: "Edge-placed for easy wire attachment; can be replaced with JST for reliability."
  },
};