<script>
    import { SelectedPresetName } from '../stores/engravingStore';
    import { SelectedClass } from '../stores/engravingStore';
    import { SelectedEngravings } from '../stores/engravingStore';
    import { NegativeEngravings } from '../stores/engravingStore';

    export let modalActive;
    let inputValue = "";

    const exportPreset = () => {
        let presetString = JSON.stringify($SelectedPresetName) + "&" + JSON.stringify($SelectedClass) + "&" + JSON.stringify($SelectedEngravings) + "&" + JSON.stringify($NegativeEngravings);
        inputValue = presetString;
        navigator.clipboard.writeText(presetString);
    }

    const importPreset = () => {
        let presetString = inputValue;
        try{
            let newPresetArray = presetString.split("&");
            let selectedPresetName = JSON.parse(newPresetArray[0]);
            let selectedClass = JSON.parse(newPresetArray[1]);
            let selectedEngravings = JSON.parse(newPresetArray[2]);
            let negativeEngravings = JSON.parse(newPresetArray[3]);

            $SelectedPresetName = selectedPresetName;
            $SelectedClass = selectedClass;
            $SelectedEngravings = selectedEngravings;
            $NegativeEngravings = negativeEngravings;
            let backdrop = document.getElementById('backdrop');
            backdrop.click();
        }
        catch(e){
            console.error(e);
            inputValue = "ERROR: Invalid preset string";
        }
    }
</script>

<div class="backdrop" on:click|self class:modal-active={modalActive} id="backdrop">
    <div class="modal">
        <h3>Import/Export Preset</h3>
        <input type="text" placeholder="Preset String" bind:value={inputValue} spellcheck=false>
        <div class="buttons-container">
            <button class="export-button" on:click={exportPreset}>
                <svg class="export-icon" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" color="#000"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                Copy Preset String
            </button>
            <button class="import-button" on:click={importPreset}>
                <svg class="import-icon" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" color="#000"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                Import Preset
            </button>
        </div>
        <svg on:click class="modal-close" width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" color="#000"><path d="M0 0h24v24H0z" fill="none"></path><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
    </div>
</div>

<style>
    .backdrop {
        visibility: hidden;
        pointer-events: none;
        width: 100%;
        height: 100%;
        position: fixed;
        left: 0;
        top: 0;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
        opacity: 0;
        transition: all 0.3s ease;
    }

    .modal {
        padding: 20px 10px;
        border-radius: 3px;
        max-width: 400px;
        margin: 10% auto;
        text-align: center;
        background: #1A1A1A;
        position: relative;
        box-shadow: 1px 1px 4px rgba(0,0,0,0.3);
    }

    .modal-active {
        visibility: visible;
        pointer-events: all;
        opacity: 1;
    }

    .modal-close {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 16px;
        height: 16px;
        color: white;
        text-decoration: none;
        cursor: pointer;
    }

    h3{
        color: #CCCCCC;
        font-size: 16px;
        font-weight: normal;
    }

    input{
        position: relative;
        background-color: #1A1A1A;
        border: none;
        outline: none;
        border-radius: 0px;
        border-bottom: 1px solid #999999;
        color: #999999;
        font-size: 12px;
        padding: 4px 8px;
        margin: 5px 0px;
        width: 300px;
        cursor: text;
        transition: all 0.4s ease;
    }

    input:focus, input:hover:enabled{
        background-color: #333333;
        border-color: #CCCCCC;
        box-shadow: 1px 1px 4px rgba(0,0,0,0.3);
    }

    input::placeholder{
        font-size: 10px;
        color:#999999;
    }

    button{
        height: 30px;
        margin: 10px 5px;
        padding: 0px 12px 2px 10px;
        font-size: 12px;
        color: #999999;
        background: #1A1A1A;
        border-color: #999999;
        cursor: pointer;
        transition: all 0.4s ease;
    }

    .export-icon, .import-icon{
        width: 16px;
        height: 16px;
        position: relative;
        top: 3px;
        color: #999999;
        transition: all 0.4s ease;
    }

    button:hover{
        color: #CCCCCC;
        background: #333333;
    }

    button:hover > .export-icon, button:hover > .import-icon{
        color: #CCCCCC;
    }
</style>