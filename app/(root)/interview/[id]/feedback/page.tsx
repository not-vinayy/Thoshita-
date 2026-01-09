// app/feedback/[id]/page.tsx

import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getFeedbackByInterviewId, getInterviewById } from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { Button } from "@/components/ui/button";

type RouteParams = {
    params: {
        id: string;
    };
};

const Feedback = async ({ params }: RouteParams) => {
    const { id } = params;

    const user = await getCurrentUser();
    if (!user) redirect("/sign-in");

    const interview = await getInterviewById(id);
    if (!interview) redirect("/");

    const feedback = await getFeedbackByInterviewId({
        interviewId: id,
        userId: user?.id,
    });

    if (!feedback) {
        return (
            <section className="section-feedback">
                <h1 className="text-xl font-bold text-center mt-10">
                    Feedback not found for this interview.
                </h1>
                <div className="flex justify-center mt-4">
                    <Link href="/" passHref>
                        <Button className="btn-primary">Back to Dashboard</Button>
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="section-feedback">
            <div className="flex flex-row justify-center">
                <h1 className="text-4xl font-semibold">
                    Feedback on the Interview - <span className="capitalize">{interview.role}</span>
                </h1>
            </div>

            <div className="flex flex-row justify-center mt-4">
                <div className="flex flex-row gap-5">
                    {/* Overall Impression */}
                    <div className="flex flex-row gap-2 items-center">
                        <Image src="/star.svg" width={22} height={22} alt="star" />
                        <p>
                            Overall Impression:{" "}
                            <span className="text-primary-200 font-bold">{feedback.totalScore}</span> /100
                        </p>
                    </div>

                    {/* Date */}
                    <div className="flex flex-row gap-2">
                        <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
                        <p>
                            {feedback.createdAt
                                ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                                : "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            <hr className="my-6" />

            <p className="mb-6">{feedback.finalAssessment}</p>

            {/* Interview Breakdown */}
            <div className="flex flex-col gap-4 mb-6">
                <h2 className="text-lg font-semibold">Breakdown of the Interview:</h2>
                {feedback.categoryScores?.map((category, index) => (
                    <div key={index}>
                        <p className="font-bold">
                            {index + 1}. {category.name} ({category.score}/100)
                        </p>
                        <p>{category.comment}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3 mb-6">
                <h3 className="text-lg font-semibold">Strengths</h3>
                <ul className="list-disc list-inside">
                    {feedback.strengths?.map((strength, index) => (
                        <li key={index}>{strength}</li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col gap-3 mb-6">
                <h3 className="text-lg font-semibold">Areas for Improvement</h3>
                <ul className="list-disc list-inside">
                    {feedback.areasForImprovement?.map((area, index) => (
                        <li key={index}>{area}</li>
                    ))}
                </ul>
            </div>

            <div className="buttons flex flex-row gap-4">
                <Link href="/" className="flex-1">
                    <Button className="btn-secondary w-full">Back to Dashboard</Button>
                </Link>

                <Link href={`/interview/${id}`} className="flex-1">
                    <Button className="btn-primary w-full">Retake Interview</Button>
                </Link>
            </div>
        </section>
    );
};

export default Feedback;
