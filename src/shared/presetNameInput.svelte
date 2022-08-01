<script>
    import { SelectedPresetName } from '../stores/engravingStore';
    export let inputValue = "";

    const handleInput = () => {
		$SelectedPresetName = inputValue;
	}
</script>

<input type="text" placeholder="Preset Name" bind:value={inputValue} on:input={handleInput} maxlength="20">

<style>
    input{
        position: relative;
        background-color: #1A1A1A;
        border: none;
        outline: none;
        border-radius: 0px;
        border-bottom: 1px solid #999999;
        color: #CCCCCC;
        font-size: 14px;
        padding: 4px 8px;
        margin: 0px 0px;
        width: 200px;
        cursor: text;
        transition: all 0.3s ease;
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
</style>