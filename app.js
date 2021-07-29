// ------------------------------------------------------------------------
// VARIABLES
// ------------------------------------------------------------------------

// button du btn-group
const btnInscription = document.querySelector(".btn-group button:first-child");
const btnConnexion = document.querySelector(".btn-group button:last-child");

// contenu textuel
const titre = document.querySelector("h1");
const info = document.querySelector(".info");

// formulaires inscritpion / connexion
const inscription = document.querySelector(".inscription");
const connexion = document.querySelector(".connexion");

// inputs
const inscriptionMailInput = document.querySelector(
	".inscription-mail-group input"
);
const inscriptionMdpInput = document.querySelector(
	".inscription-mdp-group input"
);
const connexionMailInput = document.querySelector(
	".connexion-mail-group input"
);
const connexionMdpInput = document.querySelector(".connexion-mdp-group input");

// liste connexions
const connectionList = document.querySelector(".connexionsList");
// booléens
let inscriptionBool = false;
let connexionBool = false;

// objet user
let users = [];

// ------------------------------------------------------------------------
// FONCTIONS
// ------------------------------------------------------------------------

// ------------------------------------------------------------------------
// 1 - ANIMATION DES LABELS
// ------------------------------------------------------------------------
function animInputLabel(input) {
	input.addEventListener("input", (e) => {
		if (e.target.value !== "") {
			input.parentNode.classList.add("active-input");
		} else {
			input.parentNode.classList.remove("active-input");
		}
	});
}

// ------------------------------------------------------------------------
// 2 - APPARITION DU FORM INSCRIPTION AU CLIC DU BOUTON
// ------------------------------------------------------------------------
btnInscription.addEventListener("click", (e) => {
	if (connectionList.childNodes.length > 0) {
		while (connectionList.firstChild) {
			connectionList.removeChild(connectionList.lastChild);
		}
	}
	e.preventDefault();

	if (connexion.style.display === "block") {
		connexion.style.display = "none";
		connexionBool = false;
	}

	// console.log(inscriptionBool);
	if (!inscriptionBool) {
		inscription.style.display = "block";
		inscriptionBool = true;
		// console.log(inscriptionBool);
	} else {
		inscription.style.display = "none";
		inscriptionBool = false;
		// console.log(inscriptionBool);
	}
});

// ------------------------------------------------------------------------
// 3 - APPARITION DU FORM CONNEXION AU CLIC DU BOUTON + GESTION DECONNEXION AU CLIC
// ------------------------------------------------------------------------
btnConnexion.addEventListener("click", (e) => {
	if (connectionList.childNodes.length > 0) {
		while (connectionList.firstChild) {
			connectionList.removeChild(connectionList.lastChild);
		}
	}
	if (btnConnexion.innerText === "Connexion") {
		e.preventDefault();

		if (inscription.style.display === "block") {
			inscription.style.display = "none";
			inscriptionBool = false;
		}

		if (!connexionBool) {
			connexion.style.display = "block";
			connexionBool = true;
		} else {
			connexion.style.display = "none";
			connexionBool = false;
		}
	} else if (btnConnexion.innerText === "Déconnexion") {
		// --------------------------------------
		// 5 - GESTION DECONNEXION
		// --------------------------------------

		// méthode firebase signOut
		auth.signOut().then(() => {
			// je gère en fonction du statu déconnecté
			statusChanged();
			displayUsers(users);
		});
	}
});

// ------------------------------------------------------------------------
// 4 - GESTION FORM INSCRIPTION
// ------------------------------------------------------------------------
inscription.addEventListener("submit", (e) => {
	e.preventDefault();

	let mail = inscriptionMailInput.value;
	let mdp = inscriptionMdpInput.value;

	// on alimente la bdd avec le user et les valeurs récupérées
	// penser à activer authentication mail password dans firebase

	auth
		.createUserWithEmailAndPassword(mail, mdp)
		.then((cred) => {
			// console.log(cred.user);
			users.push(cred.user.bc.email);
			statusChanged();

			// je remets à niveau le formulaire
			resetForm(
				inscription,
				inscriptionMailInput,
				inscriptionMdpInput,
				inscriptionBool
			);
		})
		.catch(() => {
			if (inscriptionMdpInput.value.length < 6) {
				inscriptionMdpInput.value = "";
				info.innerText = "Le mot de passe doit avoir 6 caractères minimum";
				setTimeout(() => {
					info.innerText = "Contenu public";
				}, 2000);
			} else {
				inscriptionBool = false;
				resetForm(
					inscription,
					inscriptionMailInput,
					inscriptionMdpInput,
					inscriptionBool
				);
				info.innerText = "Le mail existe déjà";
				setTimeout(() => {
					info.innerText = "Contenu public";
				}, 2000);
			}
		});
});
// ------------------------------------------------------------------------
// 6 - GESTION FORM CONNEXION
// ------------------------------------------------------------------------
connexion.addEventListener("submit", (e) => {
	e.preventDefault();
	let mail = connexionMailInput.value;
	let mdp = connexionMdpInput.value;

	// on récupère le user de la bdd
	auth
		.signInWithEmailAndPassword(mail, mdp)
		.then((cred) => {
			// on gère en fonction de son statut
			users.push(cred.user.bc.email);
			statusChanged();
		})
		.catch(() => {
			info.innerText = "Le mail ou le pot de passe est erroné";
			resetForm(
				connexion,
				connexionMailInput,
				connexionMdpInput,
				connexionBool
			);
			connexionBool = false;
			console.log(connexionBool);
			setTimeout(() => (info.innerText = "Contenu public"), 2000);
			// connexion.reset();
			// connexionMailInput.focus();
		});
});

// // ------------------------------------------------------------------------
// 7 - GESTION DU CONTENU EN FONCTION DU STATUT USER CONNECTE OU PAS
// utilisée dans l'étape 4 de l'inscription
// // ------------------------------------------------------------------------
function statusChanged() {
	auth.onAuthStateChanged((user) => {
		// si le user est connecté
		if (user) {
			// je gère le visuel des éléments form et btn + contenu
			connexion.style.display = "none";
			connexionBool = false;
			inscriptionBool = false;

			btnConnexion.innerText = "Déconnexion";

			// je change le contenu destiné au user connecté
			titre.innerText = `Bienvenue ${user.bc.email} !`;
			info.innerText = "Contenu privé";
		} else {
			// si pas connecté => je remets tout à niveau
			resetForm(
				connexion,
				connexionMailInput,
				connexionMdpInput,
				connexionBool
			);

			btnConnexion.innerText = "Connexion";
			titre.innerText =
				"Bienvenue. Pour accéder au contenu INSCRIVEZ-VOUS ou CONNECTEZ-VOUS";
			info.innerText = "Contenu public";
			// console.log('Le user s\'est déconnecté');
		}
	});
}

// ------------------------------------------------------------------------
// 8 - RESET FORMULAIRE
// ------------------------------------------------------------------------
function resetForm(form, inputMail, inputMdp, formBool) {
	form.reset();
	inputMail.parentNode.classList.remove("active-input");
	inputMdp.parentNode.classList.remove("active-input");
	form.style.display = "none";
	formBool = false;
}

// ------------------------------------------------------------------------
// 9 - AFFICHAGE DU NOMBRE DE CONNEXIONS PAR USER MAIL utilisée dans
// l'étape 5 DECONNEXION
// ------------------------------------------------------------------------
function displayUsers(arr) {
	let usersMails = {};

	// créer un obje qui contiendra mail + nbre occurences mail
	for (var i = 0, j = arr.length; i < j; i++) {
		usersMails[arr[i]] = (usersMails[arr[i]] || 0) + 1;
	}

	//console.log(usersMails);

	//  afficher le nombre de connexions par mail
	let connections = [];
	for (let mail in usersMails) {
		// console.log(`${mail} s'est connecté ${usersMails[mail]} fois aujourd'hui`);
		connections.push(
			`${mail} s'est connecté ${usersMails[mail]} fois aujourd'hui`
		);
	}

	connections.forEach((conn) => {
		const li = document.createElement("li");
		li.innerText = conn;
		connectionList.appendChild(li);
	});
	connectionList.style.boxShadow = "0 1px 5px #333";
}

// ------------------------------------------------------------------------
// MAIN
// ------------------------------------------------------------------------

// animation des labels
animInputLabel(inscriptionMailInput);
animInputLabel(inscriptionMdpInput);
animInputLabel(connexionMailInput);
animInputLabel(connexionMdpInput);
