export interface IUserProfile {
    email: string;
    is_active: boolean;
    is_superuser: boolean;
    full_name: string;
    id: string;
    bio: string;
    profile_url: string
}

export interface IUserProfileUpdate {
    email?: string;
    full_name?: string;
    password?: string;
    is_active?: boolean;
    is_superuser?: boolean;
}

export interface IUserProfileCreate {
    email: string;
    full_name?: string;
    password?: string;
    is_active?: boolean;
    is_superuser?: boolean;
}

export interface IUserRegisterCreate {
    full_name?: string;
    email: string;
    password: string;
    profile_url?: string;
    bio?: string;
    is_active: boolean;
    is_superuser?: boolean;
}