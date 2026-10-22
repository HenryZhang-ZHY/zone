export interface BranchMarkDefinition {
  name: string
  paths: string[]
}

/**
 * Twenty line-drawn branches. The wordmark is domain-only; the branch is the
 * app mark (favicon, touch icon, social avatar). Each is a 24×24 line drawing
 * with a 1.4px stroke, so it survives at 16px and at 32px.
 *
 * They are all one family: a main stem, two to four side shoots, no fill and no
 * enclosed shapes. The variation is in the angle, the fork height and the
 * rhythm of the twigs.
 */
export const branchMarks: BranchMarkDefinition[] = [
  {
    name: 'Original',
    paths: [
      'M8 23c.6-4 1.5-7.4 3.2-10.6C12.9 9.2 15 6 18 2',
      'M11.1 12.5C9.7 10.8 8.2 9.4 6.2 8.2',
      'M6.2 8.2C5 7.4 4 6.4 3.2 5.2',
      'M6.3 8.3c.4-1.4 1-2.7 1.8-3.9',
      'M12.8 10.2c1.9.6 3.8.8 6 .4',
      'M15.2 7.2c1.4.7 2.6 1.5 3.7 2.6',
      'M9.5 17.1c-1.4-.5-2.6-1.3-3.6-2.4',
    ],
  },
  {
    name: 'Fork',
    paths: [
      'M9 23C10 17 11 11 13 2',
      'M11 13 5 7',
      'M11 13 18 8',
    ],
  },
  {
    name: 'Twin',
    paths: [
      'M8 23C9 17 10.5 10 13 2',
      'M10.3 12.5 5.5 9',
      'M10.3 12.5 15 10',
      'M11.2 8.5 7.5 5.5',
    ],
  },
  {
    name: 'Arc',
    paths: [
      'M7 23C8 17 10 10 15 2',
      'M11 13 5.5 11',
      'M12.5 9 8 6',
      'M14 6 18 5',
    ],
  },
  {
    name: 'Candelabra',
    paths: [
      'M11 23V9',
      'M11 14 6 10',
      'M6 10V4',
      'M11 14 16 10',
      'M16 10V4',
      'M11 9V3',
    ],
  },
  {
    name: 'Willow',
    paths: [
      'M9 23C10 18 11 12 14 3',
      'M12.5 9C9.5 10 7.5 12 6.5 15',
      'M13.5 7C16.5 8 18.5 10 19.5 13',
      'M11 14C9 14.5 7.5 15.5 6.5 17',
    ],
  },
  {
    name: 'Bonsai',
    paths: [
      'M9 23C10 19 13 17 13 13C13 10 11 8 12 4',
      'M12 13C9 12 7 10 6 7',
      'M13 9C16 8 18 6 18.5 3',
    ],
  },
  {
    name: 'Spire',
    paths: [
      'M12 23V2',
      'M12 18 8 15',
      'M12 18 16 15',
      'M12 12 9 9.5',
      'M12 12 15 9.5',
      'M12 6 9.5 4',
    ],
  },
  {
    name: 'Low fork',
    paths: [
      'M7 23C9 18 11 13 13 8',
      'M10 14 4 10',
      'M10 14 17 11',
      'M13 8 11 3',
    ],
  },
  {
    name: 'High fork',
    paths: [
      'M8 23C9 17 10 11 12 5',
      'M11 8 6 3',
      'M11 8 17 4',
      'M12 5 15 1.5',
    ],
  },
  {
    name: 'Left',
    paths: [
      'M9 23C10 17 11 10 14 2',
      'M11 14 5 12',
      'M11.8 10 6 8',
      'M12.8 6 8 4',
    ],
  },
  {
    name: 'Right',
    paths: [
      'M14 23C13 17 12 10 9 2',
      'M12 14 18 12',
      'M11.2 10 17 8',
      'M10.2 6 15 4',
    ],
  },
  {
    name: 'Zigzag',
    paths: [
      'M7 23 11 17 8 11 14 5 19 2',
      'M11 17 16 15',
      'M9.5 12 15 9',
    ],
  },
  {
    name: 'Twin tips',
    paths: [
      'M9 23C10 17 11 11 12 2',
      'M12 9 6 4',
      'M12 9 18 4',
      'M12 14 8 10',
    ],
  },
  {
    name: 'Three tips',
    paths: [
      'M8 23C9 17 10 11 12 6',
      'M12 6 5 2',
      'M12 6 19 2',
      'M12 6 12 1',
      'M12 12 7 8',
    ],
  },
  {
    name: 'Feather',
    paths: [
      'M8 23C9 17 10.5 10 13 2',
      'M10.5 17 4 15',
      'M11.2 13 5 11',
      'M12 9 6 7',
      'M12.8 5 8 3',
    ],
  },
  {
    name: 'Long branch',
    paths: [
      'M8 23C9 17 10 10 13 2',
      'M11 12C15 9 18 6 20 2',
      'M9.5 17C7 16 5 14.5 3.5 12.5',
    ],
  },
  {
    name: 'Compact',
    paths: [
      'M9 22C10 17 11 13 13 8',
      'M11.3 13 6 11',
      'M11.8 10.5 15 9',
      'M12.5 8 10 5',
    ],
  },
  {
    name: 'Minimal',
    paths: [
      'M8 22 15 4',
      'M10.5 14 15 11',
    ],
  },
  {
    name: 'Signature',
    paths: [
      'M8 23C9 17 10 10 13 3',
      'M11 13C8 11 6 8.5 5 5',
      'M12.5 8C15 7 17 5 18 2',
      'M13 3C15 3.5 17 4.5 18.5 6',
    ],
  },
  {
    name: 'Fork low',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10 15 4 9', 'M10 15 17 11'],
  },
  {
    name: 'Fork high',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M12 8 6 3', 'M12 8 18 4'],
  },
  {
    name: 'Fork balanced',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M11 12 5 9', 'M11 12 18 9', 'M12.5 7 15 4'],
  },
  {
    name: 'Twin tall',
    paths: ['M8 23C9 17 10.5 10 13 2', 'M10 11 5 7', 'M10 11 16 8', 'M11.5 7 8 4'],
  },
  {
    name: 'Twin low',
    paths: ['M8 23C9.3 17 10.7 10 13 2', 'M10.5 14.5 5 11', 'M10.5 14.5 16 12', 'M12 9 15 6'],
  },
  {
    name: 'Twin arc',
    paths: ['M7 23C8 17 10 9 14 2', 'M10 13 5 10', 'M11 10 16 8', 'M12 6 9 3'],
  },
  {
    name: 'Bonsai left',
    paths: ['M9 23C10 19 13 17 13 13C13 10 11 8 12 4', 'M12 13C8.5 12 6 10 5 6', 'M13 9C16 8 18 6 18 4'],
  },
  {
    name: 'Bonsai right',
    paths: ['M9 23C10 19 13 17 13 13C13 10 11 8 12 4', 'M12 13C15 12 17 10 18 6', 'M13 9C10 8 8 6 7 4'],
  },
  {
    name: 'Bonsai high',
    paths: ['M9 23C10 19 13 17 13 13C13 10 11 8 12 4', 'M12.5 9C9.5 8 7 6 6 3', 'M13 7C16 6 18 4 18.5 2'],
  },
  {
    name: 'Bonsai low',
    paths: ['M9 23C10 19 13 17 13 13C13 10 11 8 12 4', 'M12 15C9 14 7 12 6 9', 'M13 12C16 11 18 9 18 6'],
  },
  {
    name: 'Left three',
    paths: ['M9 23C10 17 11 10 14 2', 'M11 15 5 12', 'M11.8 11 6 8', 'M12.8 7 9 4'],
  },
  {
    name: 'Right three',
    paths: ['M14 23C13 17 12 10 9 2', 'M12 15 18 12', 'M11.2 11 17 8', 'M10.2 7 14 4'],
  },
  {
    name: 'Long left',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10.5 13C7 12 4.5 10 3 7', 'M11.5 9 16 7'],
  },
  {
    name: 'Long right',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M11 13C14.5 12 17 10 19 7', 'M11.5 9 7 7'],
  },
  {
    name: 'Two level',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10 15 5 11', 'M10 15 16 12', 'M12 7 8 4', 'M12 7 16 5'],
  },
  {
    name: 'Left favor',
    paths: ['M9 23C10 17 11 10 14 2', 'M11 14 5 10', 'M11.5 10 6 7', 'M12.5 6 9 3', 'M13 12 17 10'],
  },
  {
    name: 'Right favor',
    paths: ['M14 23C13 17 12 10 9 2', 'M12 14 18 10', 'M11.5 10 17 7', 'M10.5 6 14 3', 'M11 12 7 10'],
  },
  {
    name: 'Arc right',
    paths: ['M7 23C8 17 10 9 14 2', 'M11 13 17 12', 'M12 9 18 8', 'M10 16 5 13'],
  },
  {
    name: 'Vertical',
    paths: ['M12 23V6', 'M12 14 7 10', 'M12 11 17 7'],
  },
  {
    name: 'Signature',
    paths: ['M8 23C9.5 17 11 10 13 3', 'M11 13 5 9', 'M12.5 8 16 6', 'M13 3 15 1.5'],
  },
  {
    name: '33 base',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10.5 13C7 12 4.5 10 3 7', 'M11.5 9 16 7'],
  },
  {
    name: 'Left longer',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10.5 13C6.5 12.5 4 10.5 2.5 7.5', 'M11.5 9 16 7'],
  },
  {
    name: 'Left steeper',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10.5 13C7.5 12.5 5.5 10.5 4 8', 'M11.5 9 16 7'],
  },
  {
    name: 'Left flatter',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10.5 13C7 12 5 11 3.5 9', 'M11.5 9 16 7'],
  },
  {
    name: 'Left lower',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10 15C6.5 14 4 11.5 3 8', 'M11.5 9 16 7'],
  },
  {
    name: 'Left higher',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M11 11C7.5 10 5 8 3.5 5', 'M11.5 9 16 7'],
  },
  {
    name: 'Right lower',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10.5 13C7 12 4.5 10 3 7', 'M11.5 11 16.5 9'],
  },
  {
    name: 'Right higher',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10.5 13C7 12 4.5 10 3 7', 'M12 7.5 17.5 5'],
  },
  {
    name: 'Right shorter',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10.5 13C7 12 4.5 10 3 7', 'M11.7 9 15 7.5'],
  },
  {
    name: 'Right up',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10.5 13C7 12 4.5 10 3 7', 'M11.5 9 16 5.5'],
  },
  {
    name: 'Stem curved',
    paths: ['M8 23C10 17 10.5 10 13 2', 'M10.5 13C7 12 4.5 10 3 7', 'M11.5 9 16 7'],
  },
  {
    name: 'Stem straight',
    paths: ['M8 23C9.8 17 11.5 10 13 2', 'M10.5 13C7 12 4.5 10 3 7', 'M11.5 9 16 7'],
  },
  {
    name: 'Stem steep',
    paths: ['M9 23C10.5 17 11.5 10 12.5 2', 'M10.5 13C7 12 4.5 10 3 7', 'M11.5 9 16 7'],
  },
  {
    name: 'Stem left',
    paths: ['M7 23C9 17 10.5 10 12.5 2', 'M10 13C6.5 12 4 10 2.5 7', 'M11 9 15.5 7'],
  },
  {
    name: 'Left curl',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10.5 13C7 12 4.5 10 3 7C2.5 6 2.5 5 3 4.5', 'M11.5 9 16 7'],
  },
  {
    name: 'Left short',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10.5 13C8 12 6 10 4.5 8', 'M11.5 9 16 7'],
  },
  {
    name: 'Upper left',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10.5 13C7 12 4.5 10 3 7', 'M11.5 9 16 7', 'M12 6 9.5 4.5'],
  },
  {
    name: 'Upper right',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10.5 13C7 12 4.5 10 3 7', 'M11.5 9 16 7', 'M12.5 5 15 3.5'],
  },
  {
    name: 'Lower left',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10.5 13C7 12 4.5 10 3 7', 'M11.5 9 16 7', 'M9.5 18 6 17'],
  },
  {
    name: 'Top twig',
    paths: ['M8 23C9.5 17 11 10 13 2', 'M10.5 13C7 12 4.5 10 3 7', 'M11.5 9 16 7', 'M12.3 6C13 4.5 14 3.2 15.5 2.5'],
  },
]