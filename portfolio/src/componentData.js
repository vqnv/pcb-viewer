export const componentInfo = {
  "LQFP-64_10x10mm_P05mm": {
    title: "STM32F072 MCU",
    why: "Chosen for USB Full Speed and strong ecosystem.",
    design: "Placed centrally to reduce trace lengths."
  },

  "C_0603_1608Metric": {
    title: "0603 Capacitor",
    why: "Used for decoupling and filtering.",
    design: "Placed within 2mm of VDD pins."
  },

  "SOT-23-5": {
    title: "Voltage Regulator",
    why: "Converts 5V USB to 3.3V.",
    design: "Output cap placed close for stability."
  },

  "USB_C_Receptacle": {
    title: "USB-C Receptacle",
    why: "Provides USB-C connectivity for data and power.",
    design: "Mounted on the edge for easy cable access."
  },

  "Microswitch_Left": {
    title: "Microswitch (Left)",
    why: "Tactile mechanical switch for button input.",
    design: "Positioned for comfortable thumb access."
  },

  "Microswitch_Right": {
    title: "Microswitch (Right)",
    why: "Tactile mechanical switch for button input.",
    design: "Positioned for comfortable thumb access."
  },

  "PMW3389_Sensor": {
    title: "PMW3389 Optical Sensor",
    why: "High-precision gaming sensor with 16,000 DPI capability.",
    design: "Mounted with proper lens height for optimal tracking."
  },

  "Encoder": {
    title: "Rotary Encoder",
    why: "Provides scroll wheel functionality for navigation.",
    design: "EC11 encoder with tactile detents for precise input."
  },

  "Arduino_Nano": {
    title: "Arduino Nano",
    why: "Compact microcontroller board for prototyping and I/O on the second PCB.",
    design: "Mounted so pins align with headers; position/scale can be tuned in code."
  },

  "Relay": {
    title: "Relay",
    why: "Electromechanical switch for controlling higher-power circuits from the microcontroller.",
    design: "Mounted on the second PCB; position/scale can be tuned in code."
  },

  "PinHeader_1x05_P254mm_Vertical": {
    title: "5-Pin Pin Header",
    why: "Provides 5-pin connection for the encoder.",
    design: "Mounted on the edge for easy cable access."
  },
  "SOT-223": {
    title: "SOT-223 Package",
    why: "Provides a small package for the voltage regulator.",
    design: "Mounted on the edge for easy cable access."
  },
  "SW_SPDT_PCM12": {
    title: "SPDT Switch",
    why: "Provides a single pole double throw switch for the power switch.",
    design: "Mounted on the edge for easy cable access."
  },
  "SW_PUSH_6mm_H43mm": {
    title: "Push Switch",
    why: "Provides a push button for the power switch.",
    design: "Mounted on the edge for easy cable access."
  },
  "R_0603_1608Metric": {
    title: "0603 Resistor",
    why: "Provides a resistor for the power switch.",
    design: "Mounted on the edge for easy cable access."
  },
  "R_LDR_51x43mm_P34mm_Vertical": {
    title: "LDR Resistor",
    why: "Provides a light dependent resistor for the light sensor.",
    design: "Mounted on the edge for easy cable access."
  },
  "R_Axial_DIN0207_L63mm_D25mm_P1016mm_Horizontal": {
    title: "Resistor",
    why: "Provides a resistor for the power switch.",
    design: "VERY imported for power management"
  },
  "TO-92L_Inline": {
    title: "Transistor",
    why: "Provides a transistor for the light sensor.",
    design: "VERY imported for power management"
  },
  "D_DO-41_SOD81_P1016mm_Horizontal": {
    title: "Diode",
    why: "Provides a diode for the light sensor.",
    design: "VERY imported for power management"
  },
  "D_DO-41_SOD81_P1016mm": {
    title: "Diode",
    why: "Provides a diode for the light sensor.",
    design: "VERY imported for power management"
  },
  "PinHeader_1x02_P254mm_Vertical": {
    title: "2-Pin Pin Header",
    why: "Provides a 2-pin connection for the light sensor.",
    design: "Mounted on the edge for easy cable access."
  },
};
