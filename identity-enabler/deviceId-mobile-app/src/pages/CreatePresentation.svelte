<script>
    import { onMount } from "svelte";
    import bwipjs from "bwip-js";
    import FullScreenLoader from "../components/FullScreenLoader.svelte";
    import Button from "../components/Button.svelte";
    import DevInfo from "./DevInfo.svelte";
    import PresentationJson from "./PresentationJSON.svelte";

    let loading = true;
    let showJSON = false;
    let showTutorial = false;

    const credential = window.history.state.credential;

    function createMatrix() {
        loading = true;
        try {
            // The return value is the canvas element
            bwipjs.toCanvas("presentation", {
                bcid: "datamatrix",
                text: JSON.stringify(credential),
                scale: 3,
                padding: 20,
                backgroundcolor: "ffffff"
            });
        } catch (e) {
            console.error(e);
        }
        loading = false;
    }

    const addDaysToDate = (date, days) => {
        let dateOptions = { year: "numeric", month: "long", day: "numeric" };
        let res = new Date(date);
        res.setDate(res.getDate() + days);
        return res.toLocaleDateString("en-US", dateOptions);
    };

    onMount(() => {
        createMatrix();
    });

    function goBack() {
        window.history.back();
    }

    function onClickDev() {
        showTutorial = true;
    }

    function onClickJSON() {
        showJSON = true;
    }
</script>

<main>
    {#if showTutorial}
        <DevInfo page="Presentation" bind:showTutorial />
    {:else if showJSON}
        <PresentationJson code={JSON.stringify(credential, null, 2)} bind:showJSON />
    {/if}

    {#if loading}
        <FullScreenLoader label="Creating Data Matrix..." />
    {/if}
    <div class={loading ? "wrapper mini" : "wrapper"}>
        {#if !loading}
            <div class="options-wrapper">
                <i on:click={goBack} class="icon-chevron" />
                <i on:click={onClickDev} class="icon-code" />
            </div>
            <div class="header">
                <i class="icon-credential credential-logo" />
                <header>
                    <span>Device {credential?.verifiableCredential?.credentialSubject?.DeviceData["Device Name"]}</span>
                    <p>{credential?.metaInformation?.issuer ?? "No issuer information"}</p>
                </header>
            </div>
        {/if}
        <div class="presentation-wrapper">
            <canvas id="presentation" />
        </div>
        {#if !loading}
            <footer class="footerContainer">
                <p>Valid until {addDaysToDate(credential?.verifiableCredential?.issuanceDate, 30)}</p>
                <Button
                    style="background: transparent; color: white; font-weight: 500; border: none;"
                    label="VIEW IN JSON FORMAT"
                    onClick={onClickJSON}
                />
            </footer>
        {/if}
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
        z-index: 5;
    }

    .mini {
        width: 0px;
        height: 0px;
    }

    header > p {
        margin: 2vh 0;
        font-family: "Proxima Nova", sans-serif;
        font-weight: 700;
        font-size: 5vw;
        line-height: 5vw;
        color: #fff;
        padding: 0;
    }

    header > span {
        font-family: "Proxima Nova", sans-serif;
        font-weight: 600;
        font-size: 1.7vh;
        line-height: 2.3vh;
        color: #fff;
    }

    .wrapper {
        text-align: center;
    }

    .options-wrapper > i {
        color: white;
    }

    .credential-logo {
        color: white;
        font-size: 64px;
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
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }

    footer > p {
        color: #fff;
        padding: 2vh 0 1vh 0;
        margin: 0;
        font-family: "Proxima Nova", sans-serif;
        font-weight: 500;
        font-size: 2.9vh;
        line-height: 3.5vh;
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
