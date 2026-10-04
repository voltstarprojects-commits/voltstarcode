export interface ComponentPin {
  pin: string;
  function: string;
  description: string;
}

export interface LibraryInfo {
  name: string;
  author: string;
  installNote: string;
}

export interface SearchSource {
  title: string;
  uri: string;
}

export interface IntelResult {
  searchQueries: string[];
  summary: string;
  pinout: ComponentPin[];
  recommendedLibraries: LibraryInfo[];
  wiringNotes: string[];
  codeSnippet: string;
  sources: SearchSource[];
}

export interface Diagnostic {
  line: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  fixSuggestion?: string;
}

export interface BomItem {
  name: string;
  quantity: number;
  spec: string;
  role: string;
}

export interface PinAssignment {
  boardPin: string;
  component: string;
  componentPin: string;
  wireColor: string;
  signalType: string;
  notes: string;
}

export interface CircuitNodeComponent {
  id: string;
  name: string;
  type: string;
  icon: string;
  assignedPin: string;
  pins: string[];
  x: number;
  y: number;
}

export interface WireConnection {
  fromPin: string;
  toComponentId: string;
  toPin: string;
  color: string;
  label: string;
}

export interface CircuitBoard {
  id: string;
  name: string;
  type: string;
  pins: string[];
}

export interface WiringDiagram {
  board: CircuitBoard;
  components: CircuitNodeComponent[];
  connections: WireConnection[];
}

export interface Project {
  projectTitle: string;
  targetPlatform: string;
  summary: string;
  code: string;
  explanation: string;
  bom: BomItem[];
  pinTable: PinAssignment[];
  wiringDiagram: WiringDiagram;
  potentialIssues: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  searchQueries?: string[];
  sources?: Array<{ title: string; uri: string }>;
  modelUsed?: string;
  isGrounded?: boolean;
}
