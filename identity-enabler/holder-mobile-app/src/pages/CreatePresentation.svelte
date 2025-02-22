<script>
    import { onMount } from "svelte";
    import bwipjs from "bwip-js";
    import { ServiceFactory } from "../factories/serviceFactory";
    import { error } from "../lib/store";
    import FullScreenLoader from "../components/FullScreenLoader.svelte";
    import Button from "../components/Button.svelte";
    import DevInfo from "./DevInfo.svelte";
    import PresentationJson from "./PresentationJSON.svelte";
    import { Plugins } from "@capacitor/core";

    const { App } = Plugins;
    let presentationJSON = "";
    let loading = true;
    let showJSON = false;
    let showTutorial = false;

    const credential = window.history.state.credential;
    const identityService = ServiceFactory.get("identity");
    const preparedCredentialDocument = identityService.prepareCredentialForDisplay(credential.credentialDocument);

    function createMatrix(content) {
        try {
            // The return value is the canvas element
            bwipjs.toCanvas("presentation", {
                bcid: "datamatrix",
                text: content,
                scale: 3,
                padding: 20,
                backgroundcolor: "ffffff"
            });
        } catch (e) {
            console.error(e);
        }
    }

    const addDaysToDate = (date, days) => {
        let dateOptions = { year: "numeric", month: "long", day: "numeric" };
        let res = new Date(date);
        res.setDate(res.getDate() + days);
        return res.toLocaleDateString("en-US", dateOptions);
    };

    onMount(() => {
        setTimeout(async () => {
            error.set(null);
            try {
                const storedIdentity = await identityService.retrieveIdentity();
                const verifiablePresentation = await identityService.createVerifiablePresentation(
                    storedIdentity,
                    credential?.credentialDocument
                );
                presentationJSON = JSON.stringify(verifiablePresentation, null, 2);
                createMatrix(JSON.stringify(verifiablePresentation));
                loading = false;
            } catch (err) {
                error.set("Error creating identity. Please try again.");
                loading = false;
            }
        }, 500);
    });

    function goBack() {
        if (showTutorial) {
            showTutorial = false;
            return;
        }

        if (showJSON) {
            showJSON = false;
            return;
        }

        window.history.back();
    }

    function onClickDev() {
        showTutorial = true;
    }

    function onClickJSON() {
        showJSON = true;
    }

    onMount(() => App.addListener("backButton", goBack).remove);
</script>

<main>
    {#if showTutorial}
        <DevInfo page="Presentation" bind:showTutorial />
    {:else if showJSON}
        <PresentationJson code={presentationJSON} bind:showJSON />
    {/if}

    {#if loading}
        <FullScreenLoader label="Creating Data Matrix..." />
    {/if}

    <div class="wrapper">
        <div class="options-wrapper">
            <i on:click={goBack} class="icon-chevron" />
            <i on:click={onClickDev} class="icon-code" />
        </div>
        <header>
            {#if credential.enrichment.credentialLabel === "Organisation ID"}
                <i class="icon-zebra credential-logo" />
                <span>{credential.metaInformation.issuer.toUpperCase()}</span>
            {:else}
                <i class="icon-credential credential-logo" />
                <span>{credential.enrichment.issuerLabel.toUpperCase()}</span>
            {/if}
            <p>{credential.enrichment.credentialLabel}</p>
        </header>
        <div class="presentation-wrapper">
            <canvas id="presentation" />
        </div>
        <footer class="footerContainer">
            {#if credential.enrichment.credentialLabel === "Organisation ID"}
                <span>Scan this Barcode with the Device ID app</span>
                <p>Valid until {addDaysToDate(preparedCredentialDocument.issuanceDate, 30)}</p>
            {:else}
                <p>Valid until {addDaysToDate(preparedCredentialDocument.issuanceDate, 30)}</p>
            {/if}
            <Button
                style="background: transparent; color: white; font-weight: 500; font-size: 1.7vh; line-height: 2.3vh; border: none; height:fit-content;"
                label="VIEW IN JSON FORMAT"
                onClick={onClickJSON}
            />
        </footer>
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        position: relative;
        height: 100%;
        background: black;
    }

    canvas {
        position: relative;
        width: 100%;
    }

    header {
        z-index: 1;
        height: fit-content;
        margin-bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    header > p {
        margin: 1.5vh 0 6.2vh 0;
        font-family: "Proxima Nova", sans-serif;
        font-weight: 700;
        font-size: 2.4vh;
        line-height: 2.4vh;
        color: #fff;
        padding: 0;
    }

    header > span {
        font-family: "Proxima Nova", sans-serif;
        font-weight: 600;
        font-size: 1.4vh;
        line-height: 1.8vh;
        color: #fff;
    }

    .wrapper {
        text-align: center;
    }

    .credential-logo {
        font-size: 64px;
        margin-bottom: 1.5vh;
    }

    .presentation-wrapper {
        height: fit-content;
        position: relative;
        background: white;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 100%;
        bottom: 1.5vh;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }

    footer > p {
        color: #fff;
        padding: 1vh 0 1vh 0;
        margin: 0;
        font-family: "Proxima Nova", sans-serif;
        font-weight: 500;
        font-size: 2.9vh;
        line-height: 3.5vh;
    }

    footer > span {
        color: #fff;
        margin-top: 5.4vh;
        font-family: "Proxima Nova", sans-serif;
        font-weight: 500;
        font-size: 1.7vh;
    }

    .options-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: 3.5vh 3.5vh 0 3.5vh;
        position: relative;
        z-index: 2;
    }

    .footerContainer {
        position: fixed;
        text-align: center;
        width: 100%;
    }
</style>
