# ngm-trudy-project

This is a skeleton graphics project to be processed by `ngm-trudy`. Projects that are started from this project can be updated from this project as well.

Special files:
- `.trudy/updateConfig`: This file is used to determine how `trudy update` is performed.
    + `include`: list of directory globs to search within current trudy project. paths not listed will be excluded from merge.
    + `exclude`: single files to override within the include globs. cannot include wildcards or folders.

Special folders:
- `.trudy/templates`: Files in here are used by `trudy graphic` to create new ai2html files and corresponding graphics embeds.