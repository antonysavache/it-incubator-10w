export interface LoginDTO {
    loginOrEmail: string;
    password: string;
}

export interface LoginResponseDTO {
    accessToken: string;
}