# Session Cleaner

Scans the current Live set, previews what could be deleted, and on
confirmation removes it. Live's own undo (Cmd/Ctrl-Z) is the safety net
for every action.

## What it can remove

| Category | Default | What it targets |
| --- | --- | --- |
| Empty tracks | **on** | Tracks with **no** clips (Session+Arrangement) **and** no devices. Groups are always skipped. |
| Muted tracks | off | Tracks where `mute == 1`. Off by default because it's destructive. |
| Muted/disabled clips | **on** | Clips where `Clip.muted == 1`. Honours the Scope menu. |
| Inactive devices | **on** | Devices where `Device.is_active == 0`. |
| Empty return tracks | off | Return tracks with no devices. Off by default because returns are often kept around for routing. |

The **Scope** menu (Session / Arrangement / Both) only applies to muted
clips. Tracks and devices are always all-set.

## Use

1. Drop the device on any audio track.
2. Toggle the categories you want.
3. Press **SCAN** — the status line shows
   `Plan: <T> tracks, <C> clips, <D> devices, <R> returns.`
4. If it looks right, press **CLEAN**. If it doesn't, change the toggles
   and SCAN again, or do nothing.
5. After CLEAN, hit Cmd/Ctrl-Z if you want to roll back. Live's undo
   captures every step.

## Parameters

| Name | Type | Notes |
| --- | --- | --- |
| `scan_btn` | momentary | Build a deletion plan (no destructive ops). |
| `clean_btn` | momentary | Execute the most recent plan. |
| `cat_empty` | toggle | Empty tracks (default on). |
| `cat_muted` | toggle | Muted tracks (default off). |
| `cat_clips` | toggle | Muted clips (default on). |
| `cat_devices` | toggle | Inactive devices (default on). |
| `cat_returns` | toggle | Empty return tracks (default off). |
| `scope_menu` | enum | Session / Arrangement / **Both**. |

## Order of operations

Deletes are issued in this order, which is what avoids index-shift bugs:
1. Clips (by clip id, not index).
2. Devices, grouped per track, **descending** device index.
3. Tracks, **descending** track index.
4. Return tracks, **descending** return index.

## Caveats

- The plan is computed at SCAN time. If you change the set between
  SCAN and CLEAN, the plan can be stale — you'll see fewer/more
  deletions than the preview. Re-SCAN if you're worried.
- Group tracks are deliberately never deleted, even if empty, because
  collapsed groups are often the user's mental categorisation.
- Sends *to* deleted return tracks are removed by Live automatically;
  the cleaner doesn't touch send levels.

## Prior art / inspiration

- [Liveset Cleaner — Live Workflow Tools](https://liveworkflowtools.gumroad.com/l/livesetcleaner) ($14)
- [Delete All Disabled Clips — ElisabethHomeland](https://www.elisabethhomeland.com/products/delete-all-disabled-clips-by-elisabethhomeland-maxforlive-device-for-ableton-live) (free)
- [Delete Muted Clips — Dennis DeSantis](https://maxforlive.com/library/device/8364/delete-muted-clips) (free)
