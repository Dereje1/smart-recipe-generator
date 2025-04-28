import { useRouter } from 'next/router';

interface UserLinkProps {
    userId: string;
    name: string;
}

export default function UserLink({ userId, name }: UserLinkProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/UserActivity?userId=${userId}`);
    };

    return (
        <span
            onClick={handleClick}
            className="text-gray-600 hover:text-gray-800 hover:underline cursor-pointer"
        >
            {name}
        </span>
    );
}
