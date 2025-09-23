import Image from "next/image";
import styles from "./ProfilePic.module.css";

export default function ProfilePic() {
    return(
        <div className={styles.avatar}>
            <Image
                src="/profile.jpg"
                alt="Profile Picture"
                width={100}
                height={100}
            />
        </div>
    )
}