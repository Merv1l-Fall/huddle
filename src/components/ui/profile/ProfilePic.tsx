type Props = {
	name: string
	size: number
	photoURL?: string
	color?: string
}

const ProfilePic = ({name, size, photoURL, color}: Props) => {
	const initial = name.charAt(0).toUpperCase() || '?'

	const style: React.CSSProperties = {
        width: `${size}rem`,
        height: `${size}rem`,
        borderRadius: "10px",
        backgroundColor: color || "var(--main-green)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: `${size*0.5}rem`,
        userSelect: "none",
		overflow: "hidden",
    };

	return (
		<div className="profile-pic" aria-label={`Profile: ${name}`} style={style}>
			{photoURL ? (
				<img src={photoURL} alt={name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			) : (
				<p>{ initial }</p>
			)}
		</div>
	)
}


export default ProfilePic