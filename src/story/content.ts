export const legacyImages = [
  { src: '/images/legensy/pink-portrait.jpg', alt: 'Legensy moon hoodie and mirrored goggles against a pink backdrop' },
  { src: '/images/legensy/lavender-duo.jpg', alt: 'Two models wearing Legensy moon hoodies against a lavender backdrop' },
  { src: '/images/legensy/teal-camcorder.jpg', alt: 'Model wearing a Legensy hoodie and holding a camcorder against a teal backdrop' },
];
export const lyraPreviewImages = [
  { src: '/images/lyra-social-feed.png', alt: 'Lyra social feed with event cards and stories' },
  { src: '/images/lyra-handheld.png', alt: 'Lyra app displayed on a phone held in a hand' },
  { src: '/images/lyra-flyer-chat.png', alt: 'Lyra flyer generation conversation and event poster' },
];
export type ProjectId = 'lyra' | 'legacy';
export const projects: {id:ProjectId;name:string;category:string;description:string;detail:string;notes:string[]}[] = [
  {id:'lyra',name:'Lyra Plus',category:'Consumer tech · In progress',description:'Making social life feel connected.',detail:'Lyra Plus brings event ticketing and gamification together, exploring how the fragmented parts of social life can become one connected experience. It’s the consumer-tech problem I’m working on now.',notes:['Event ticketing','Gamification','Social experiences']},
  {id:'legacy',name:'Legensy',category:'Clothing brand · Previous chapter',description:'An idea I grew into a first launch.',detail:'I started Legensy at 16 and spent three years building it. I launched during my first year of college and made around $5,000 in revenue. I eventually closed the brand to pursue consumer technology, carrying that experience of building something from scratch with me.',notes:['2023','Clothing brand','Based in NY']},
];
export const openSourceProjects: {name:string;description:string;url:string}[] = [
  {
    name:'Claudex',
    description:'Let Codex phone a friend. A tiny MCP server that brings the locally authenticated Claude Code CLI into Codex without an Anthropic API key.',
    url:'https://github.com/jordimontano/claudex',
  },
];
