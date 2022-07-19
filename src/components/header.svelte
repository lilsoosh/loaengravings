<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    //tabs
    export let tabs;
    export let activeTab;
</script>

<header>
    <div class="header-container">
        <div class="headerBG"></div>
        <img src="../images/lil_soosh.png" alt="logo" class="logo">
        <h1 class="site-title">SOOSH.site</h1>
        <ul>
            {#each tabs as tab}
            <li on:click={() => dispatch('tabChange',tab)}>
                <div class:active={tab===activeTab}>{tab}</div>
            </li>
            {/each}
        </ul>
    </div>
</header>

<style>
    .header-container{
        max-width: 1920px;
        margin-left: auto;
        margin-right: auto;
        position: relative;
        padding: 0px;
        width: 100%;
        height: 50px;
        z-index: 1000;
        display: flex;
    }

    .headerBG{
        position: absolute;
        width: 100%;
        height: 100%;
        background: #333333;
        z-index: -1;
    }

    .logo{
        position: relative;
        height: 36px;
        width: 36px;
        top: calc(50% - 18px);
        margin: 0px 10px 0px 10px;
        border-radius: 5px;
    }

    .site-title{
        margin: 0px 18px 0px 0px;
        padding: 0px;
        color: white;
        cursor: pointer;
    }

    ul{
        display:flex;
        margin: 0px;
        padding: 0px;
        list-style-type: none;
    }

    li{
        position: relative;
        margin: 12px 8px;
        padding: 4px 8px;
        font-size: 13px;
        font-weight: bold;
        text-transform: uppercase;
        color: #CCCCCC;
        cursor: pointer;
        transition: color 0.5s ease;
    }

    li:hover{
        color: #ad866d;
    }

    li::before{
        content: "";
        position: absolute;
        display: block;
        width: 100%;
        height: 1px;
        bottom: -4px;
        left: 0;
        background-color: #ad866d;
        transform: scaleX(0);
        transition: transform 0.5s ease;
    }

    li:hover::before{
        transform: scaleX(1);
    }

    .active{
        color: #ad866d;
    }

    .active::before{
        content: "";
        position: absolute;
        display: block;
        width: 100%;
        height: 1px;
        bottom: -4px;
        left: 0;
        background-color: #ad866d;
    }
</style>