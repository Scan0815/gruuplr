export class TokenDTO {
  tokenType: "access"|"refresh" = "access";
  id!: string;
}