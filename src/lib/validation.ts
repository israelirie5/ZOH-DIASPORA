import { z } from "zod";

export const registrationSchema = z.object({
  firstName: z.string().trim().min(1, "Veuillez renseigner votre prénom.").max(80),
  lastName: z.string().trim().min(1, "Veuillez renseigner votre nom.").max(80),
  email: z.string().trim().min(1, "Veuillez renseigner votre adresse email.").email("Veuillez saisir une adresse email valide.").toLowerCase(),
  phone: z.string().trim().min(5, "Veuillez renseigner votre téléphone / WhatsApp.").max(40),
  city: z.string().trim().min(1, "Veuillez renseigner votre ville de résidence.").max(100),
  eventId: z.uuid("Veuillez sélectionner un événement."),
  source: z.enum(["Réseaux sociaux", "Association", "Ambassade / institution", "Entreprise", "Un proche", "Client ZOH-HENAN", "Autre"]).optional().or(z.literal("")),
  consent: z.literal(true, { error: "Votre consentement est nécessaire pour vous inscrire." }),
  website: z.string().max(0, "Requête invalide."),
});

export const scanSchema = z.object({ token: z.string().uuid(), eventId: z.string().uuid() });
