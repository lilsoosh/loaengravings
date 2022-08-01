<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
</script>

<button type="button" on:click={() => dispatch('click')}>Import/Export</button>

<style>
    button{
        height: 30px;
        width: 100px;
        margin: 0px 0px;
        padding: 0px 0px;
        font-size: 12px;
        color: #999999;
        background: #1A1A1A;
        border-color: #999999;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    button:hover{
        color: white;
        background: #333333;
    }
</style>