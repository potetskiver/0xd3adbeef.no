const apiUrl = "https://0xd3adbeef.no/memeapi/";

async function hentOgByttBilde(boks, knapp) {
	try {
		const response = await fetch(apiUrl);
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || `HTTP ${response.status}`);
		}

		let bilde = boks.querySelector("img");
		if (!bilde) {
			bilde = document.createElement("img");
			boks.insertBefore(bilde, boks.querySelector("button"));
		}

		bilde.src = data.url;
		bilde.width = data.width;
		bilde.height = data.height;
		knapp.remove();
	} catch (error) {
		console.error("Kunne ikke hente bilde:", error);
	}
}

for (let i = 1; i <= 6; i++) {
	const boks = document.getElementById(`boks${i}`);
    const knapp = document.getElementById(`bilde${i}`);
	knapp.addEventListener("click", () => hentOgByttBilde(boks, knapp));
}
