// Boards shown in the 3D scene. To add one:
//   1. From portfolio/: node tools/step-to-glb.mjs <file.step> <id>   (npm install in tools/ first)
//   2. Add an entry here with the same id.
export const boards = [
  {
    id: 'bms',
    label: '4S LiPo BMS',
    title: '4S LiPo Battery Management System',
    context: 'Personal project · Altium Designer, STM32, I2C, UART',
    points: [
      'BQ76920 AFE with an STM32 host, back-to-back N-channel MOSFETs for bidirectional isolation, and a 5mΩ Kelvin sense resistor.',
      'Interrupt-driven fault state machine on the hardware ALERT pin that separates auto-recoverable from latching faults (OV, UV, OCD, SCD).',
      'Firmware for Coulomb counting and passive cell balancing with adjacent-cell constraints, using runtime GAIN/OFFSET calibration for millivolt-accurate cell monitoring.',
      'Analog input RC filter network and LDO power architecture sourced from the battery stack to keep MCU rails stable during high-current discharge.',
    ],
    tags: ['Altium', 'BQ76920', 'STM32', 'I2C', 'UART'],
    position: [-8, -20.5, -31],
  },
  {
    id: 'vtx',
    label: 'Unified VTX Board',
    title: 'Unified Analog VTX Board',
    context: 'Waterloo Aerial Robotics Group',
    points: [
      'Unified analog VTX board built around an STM32G4.',
      'Multiplexes multiple camera feeds into one switchable output.',
      'Dedicated OSD chip for telemetry overlay.',
    ],
    tags: ['Altium', 'STM32G4', 'Analog Video', 'OSD'],
    position: [16, -26, -13],
  },
  {
    id: 'current-sense',
    label: 'Motor Current Sense Board',
    title: 'Motor Current-Sense Board',
    context: 'Midnight Sun Solar Race Car Team',
    points: [
      'Measures motor current draw across a 120V bus with a precision Kelvin-sense shunt resistor and isolated ADC.',
      'Separates the high-voltage sense domain from the 3.3V logic domain.',
      'Digital isolation on the I2C interface and an isolated DC-DC supply bridge the 120V domain to low-voltage control electronics, protecting the STM32 from the HV bus.',
    ],
    tags: ['Altium', 'Isolation', 'High Voltage', 'I2C', 'STM32'],
    position: [41.5, -13, -1],
  },
];
