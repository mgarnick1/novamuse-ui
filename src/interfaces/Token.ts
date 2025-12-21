export interface Token {
  AuthenticationResult: {
    AccessToken: string;
    IdToken: string;
    TokenType: string;
    RefreshToken: string;
    ExpiresIn: number;
  };
}
