<script lang="ts">
  import type { Resume } from '$lib/data/types';
  import { tt } from '$lib/i18n';
  import BrandIcon from './BrandIcon.svelte';
  import { GraduationCap } from '@lucide/svelte';

  export let resume: Resume;
  export let open: boolean = false;
  export let id: string = 'stalk-panel';
</script>

<div {id} role="region" aria-label="socials" class="panel" class:open aria-hidden={!open}>
  <div class="panel-inner">
    <div class="grid grid-cols-2 gap-2 pt-3 sm:grid-cols-4">
      {#if resume.links.instagram}
        <a href={resume.links.instagram} target="_blank" rel="noopener" class="mini-card group">
          <div class="card-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
              ><path
                d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.34 4.14.63a5.88 5.88 0 0 0-2.12 1.39A5.88 5.88 0 0 0 .63 4.14C.34 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.27 2.15.56 2.91a5.88 5.88 0 0 0 1.39 2.12 5.88 5.88 0 0 0 2.12 1.39c.76.29 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.27 2.91-.56a5.88 5.88 0 0 0 2.12-1.39 5.88 5.88 0 0 0 1.39-2.12c.29-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.27-2.15-.56-2.91a5.88 5.88 0 0 0-1.39-2.12A5.88 5.88 0 0 0 19.86.63C19.1.34 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-10.4a1.44 1.44 0 1 0 0-2.88 1.44 1.44 0 0 0 0 2.88z"
              /></svg
            >
          </div>
          <p class="font-pixel text-[10px] text-[color:var(--color-gb-light)]">INSTAGRAM</p>
          <p class="mt-0.5 text-[11px] text-zinc-400 group-hover:text-zinc-200">@pedro_lagesr</p>
        </a>
      {/if}

      <a href={resume.links.linkedin} target="_blank" rel="noopener" class="mini-card group">
        <div class="card-icon"><BrandIcon name="linkedin" size={16} /></div>
        <p class="font-pixel text-[10px] text-[color:var(--color-gb-light)]">LINKEDIN</p>
        <p class="mt-0.5 text-[11px] text-zinc-400 group-hover:text-zinc-200">in/plagesribeiro</p>
      </a>

      <a href={resume.links.github} target="_blank" rel="noopener" class="mini-card group">
        <div class="card-icon"><BrandIcon name="github" size={16} /></div>
        <p class="font-pixel text-[10px] text-[color:var(--color-gb-light)]">GITHUB</p>
        <p class="mt-0.5 text-[11px] text-zinc-400 group-hover:text-zinc-200">@plagesribeiro</p>
      </a>

      {#if resume.links.lattes}
        <a href={resume.links.lattes} target="_blank" rel="noopener" class="mini-card group">
          <div class="card-icon"><GraduationCap class="h-4 w-4" /></div>
          <p class="font-pixel text-[10px] text-[color:var(--color-gb-light)]">LATTES</p>
          <p class="mt-0.5 text-[11px] text-zinc-400 group-hover:text-zinc-200">
            {$tt({ pt: 'cv acadêmico', en: 'academic cv' })}
          </p>
        </a>
      {/if}
    </div>
  </div>
</div>

<style>
  .panel {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition:
      grid-template-rows 220ms ease-out,
      opacity 180ms ease-out;
  }
  .panel.open {
    grid-template-rows: 1fr;
    opacity: 1;
  }
  .panel-inner {
    overflow: hidden;
    min-height: 0;
  }
  :global(.mini-card) {
    position: relative;
    display: block;
    overflow: hidden;
    border-radius: 0.75rem;
    border: 1px solid rgb(39 39 42);
    background: rgba(9 9 11 / 0.6);
    padding: 0.75rem;
    transition: all 200ms;
  }
  :global(.mini-card:hover) {
    border-color: rgba(155, 188, 15, 0.5);
    transform: translateY(-1px);
  }
  :global(.mini-card .card-icon) {
    display: inline-flex;
    height: 1.75rem;
    width: 1.75rem;
    align-items: center;
    justify-content: center;
    border-radius: 0.4rem;
    border: 1px solid rgb(39 39 42);
    background: rgba(24 24 27 / 0.8);
    color: rgb(228 228 231);
    margin-bottom: 0.5rem;
    transition: transform 200ms;
  }
  :global(.mini-card:hover .card-icon) {
    transform: scale(1.08) rotate(-4deg);
  }
  @media (prefers-reduced-motion: reduce) {
    .panel,
    :global(.mini-card),
    :global(.mini-card .card-icon) {
      transition: none;
    }
  }
</style>
