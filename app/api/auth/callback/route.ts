import { NextRequest, NextResponse } from "next/server";

const KC_TOKEN_URL = "https://accounts.kingsch.at/developer/oauth2/token";
const KC_PROFILE_URL = "https://accounts.kingsch.at/developer/api/profile";
const KC_CLIENT_ID = "bb4eb4fd-ecd3-4370-9110-3ac76bac5575";

async function fetchUserProfile(accessToken: string) {
    try {
        const response = await fetch(KC_PROFILE_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Profile fetch failed: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        throw error;
    }
}

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");

        if (!code) {
            return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
        }

        // Exchange code for tokens
        const tokenResponse = await fetch(KC_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                grant_type: "code",
                client_id: KC_CLIENT_ID,
                code,
                redirect_uri: "http://localhost:3000/api/auth/callback"
            })
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Token exchange failed:', tokenResponse.status, errorText);
            return NextResponse.json({ error: "Token exchange failed" }, { status: tokenResponse.status });
        }

        const tokenData = await tokenResponse.json();
        
        // Simple redirect to home page
        const response = NextResponse.redirect("http://localhost:3000/");

        // Store tokens
        response.cookies.set("accessToken", tokenData.access_token, {
            maxAge: 60 * 30,
            path: "/",
            secure: false, // Set to false for localhost
            sameSite: "lax"
        });

        if (tokenData.refresh_token) {
            response.cookies.set("refreshToken", tokenData.refresh_token, {
                maxAge: 60 * 60 * 24 * 365,
                path: "/",
                secure: false,
                sameSite: "lax"
            });
        }

        // Try to fetch and store user profile
        try {
            const userProfile = await fetchUserProfile(tokenData.access_token);
            const profile = userProfile.profile || userProfile;
            
            const mappedProfile = {
                userId: profile.id || 'unknown',
                username: profile.username || 'user',
                phone: profile.phone_number || profile.phone || '',
                email: profile.email || '',
                firstName: profile.first_name || profile.name?.split(' ')[0] || '',
                lastName: profile.last_name || profile.name?.split(' ').slice(1).join(' ') || '',
                profilePicture: profile.avatar || profile.profile_picture || '',
                name: profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
            };

            response.cookies.set("userProfile", JSON.stringify(mappedProfile), {
                maxAge: 60 * 30,
                path: "/",
                secure: false,
                sameSite: "lax"
            });
        } catch (profileError) {
            console.error('Failed to fetch user profile, but continuing:', profileError);
            // Continue without profile data
        }

        return response;
    } catch (error) {
        console.error("Error in callback route:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}