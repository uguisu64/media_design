<script>
    let { data } = $props()
</script>

<h1>リアルタイム人数カウント</h1>

{#if data.counts && data.counts.length > 0}
    {#each data.counts as record}
        <div class="card">
            <h2>📍 {record.location || '不明なカメラ'}</h2>
            <p class="count">{record.count ?? record.avg_count ?? 'N/A'}</p>
            <p class="timestamp">
                最終更新: {new Date(record.time ?? record.time_window).toLocaleString('ja-JP')}
            </p>
        </div>
    {/each}
{:else}
<p>データがまだありません。</p>
{/if}

<style>
  /* 簡単なスタイリング */
  .card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .count {
    font-size: 3em;
    font-weight: bold;
    text-align: center;
    margin: 0;
  }
  .timestamp {
    text-align: right;
    color: #666;
    font-size: 0.9em;
  }
</style>