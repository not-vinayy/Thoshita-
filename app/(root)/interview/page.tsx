// import React from 'react'
import Agent from "@/components/agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
    const user = await getCurrentUser();

    // If user is not logged in, you can render a message or redirect
    if (!user) {
        return <p>Please sign in to access the interview.</p>;
    }

    return (
        <>
            <h3>Interview Generation</h3>

            <Agent
                userName={user.name}  // guaranteed to be string
                userId={user.id}      // guaranteed to be string
                type="generate"
            />
        </>
    );
};

export default Page;
