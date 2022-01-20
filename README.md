# Contributor Submodules Action

A GitHub Action that automates adding submodules

```yaml
  - name: Contributor_Submodules_Action
    uses: noahreinalter/Contributor_Submodules_Action@latest
      with:
        # The url of the submodule
        url: 'url'
        # Allowed users(space separated) to add new submodules
        users: 'user1 user2'
        # default: '/^\d*$/' Regex for the folders to link
        regex: '/^\d*$/'
        # default: 'false' Adds links for submodules if they are missing
        reload_submodules: 'false'
```
