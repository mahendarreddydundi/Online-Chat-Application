import { useState, useEffect } from "react";

const Avatar = ({ src, alt = "avatar", className = "w-10 rounded-full", size = "md" }) => {
	const [imageSrc, setImageSrc] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	const placeholder = "https://cdn0.iconfinder.com/data/icons/communication-line-10/24/account_profile_user_contact_person_avatar_placeholder-512.png";

	useEffect(() => {
		if (!src) {
			setImageSrc(placeholder);
			setIsLoading(false);
			return;
		}

		// Preload image
		const img = new Image();
		img.onload = () => {
			setImageSrc(src);
			setIsLoading(false);
			setHasError(false);
		};
		img.onerror = () => {
			setImageSrc(placeholder);
			setIsLoading(false);
			setHasError(true);
		};
		img.src = src;
	}, [src]);

	const sizeClasses = {
		sm: "w-8 h-8",
		md: "w-10 h-10",
		lg: "w-12 h-12",
		xl: "w-16 h-16",
	};

	// Use className if provided, otherwise use size-based classes
	const dimensionClass = className || sizeClasses[size] || sizeClasses.md;

	return (
		<div className={`${dimensionClass} relative overflow-hidden bg-gray-600 flex items-center justify-center rounded-full`}>
			{isLoading ? (
				<div className="w-full h-full bg-gray-600 animate-pulse flex items-center justify-center">
					<svg className="w-1/2 h-1/2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
					</svg>
				</div>
			) : (
				<img
					src={imageSrc || placeholder}
					alt={alt}
					className="w-full h-full object-cover"
					loading="lazy"
					onError={(e) => {
						if (!hasError) {
							e.target.src = placeholder;
							setHasError(true);
						}
					}}
				/>
			)}
		</div>
	);
};

export default Avatar;

