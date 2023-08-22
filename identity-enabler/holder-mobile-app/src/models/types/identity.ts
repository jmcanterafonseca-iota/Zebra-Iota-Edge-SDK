import type { Doc } from "../../services/utilHttp";
import type { Key } from "./key";

export type Identity = {
    didDoc: string;
    publicAuthKey: string;
    privateAuthKey: string;
    doc: Doc;
    keys: Key[];
};

export type IdentityConfig = {
    node: string;
    network: string;
    permanode?: string;
};

export type VerifiableCredentialEnrichment = {
    issuerLabel: string;
    logo: string;
    credentialLabel: string;
    theme: string;
};
