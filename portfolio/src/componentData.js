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
  }
};
