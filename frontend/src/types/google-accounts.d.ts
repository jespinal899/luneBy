// Tipos mínimos de Google Identity Services (script gsi/client).
interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  ux_mode?: 'popup' | 'redirect';
  auto_select?: boolean;
}

interface GoogleButtonOptions {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: number | string;
  locale?: string;
}

interface GoogleAccountsId {
  initialize: (config: GoogleIdConfiguration) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
  prompt: () => void;
  cancel: () => void;
}

interface Window {
  google?: {
    accounts: {
      id: GoogleAccountsId;
    };
  };
}
