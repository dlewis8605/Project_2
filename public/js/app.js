new Vue({
  el: '#app',
  data: {
    user: null, // Holds authenticated user { id, username, email, favorites: [] }
    loading: false,
    assets: [],
    searchQuery: '',
    selectedCategory: 'all',
    selectedAsset: null, // For detail/preview modals
    
    // Auth Form States
    authIdentifier: '',
    authPassword: '',
    authUsername: '',
    authEmail: '',
    authError: null,
    
    // Asset Submission Form States
    newAsset: {
      title: '',
      description: '',
      category: 'css',
      code: '',
      tags: ''
    },
    submitError: null,
    submitSuccess: false,
    
    // Toast notification state
    showToast: false,
    toastMessage: '',
    
    // Online check
    isOffline: !navigator.onLine
  },
  
  computed: {
    filteredAssets() {
      // Direct front-end filtering for snappy search response
      return this.assets.filter(asset => {
        const matchesCategory = this.selectedCategory === 'all' || asset.category === this.selectedCategory;
        
        const q = this.searchQuery.toLowerCase().trim();
        if (!q) return matchesCategory;
        
        const matchesSearch = asset.title.toLowerCase().includes(q) ||
                              asset.description.toLowerCase().includes(q) ||
                              asset.tags.some(tag => tag.toLowerCase().includes(q)) ||
                              asset.creatorName.toLowerCase().includes(q);
                              
        return matchesCategory && matchesSearch;
      });
    }
  },
  
  methods: {
    // 1. Toast Notification Trigger
    triggerToast(message) {
      this.toastMessage = message;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 2500);
    },
    
    // 2. Auth Actions
    async checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.authenticated) {
          this.user = data.user;
        } else {
          this.user = null;
        }
      } catch (err) {
        console.error('Error verifying user auth session:', err);
      }
    },
    
    async loginUser(e) {
      if (e) e.preventDefault();
      this.authError = null;
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loginIdentifier: this.authIdentifier,
            password: this.authPassword
          })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Login failed.');
        }
        this.user = data.user;
        this.triggerToast('Logged in successfully!');
        // Redirect to catalog dashboard
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1000);
      } catch (err) {
        this.authError = err.message;
      }
    },
    
    async registerUser(e) {
      if (e) e.preventDefault();
      this.authError = null;
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: this.authUsername,
            email: this.authEmail,
            password: this.authPassword
          })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Registration failed.');
        }
        this.user = data.user;
        this.triggerToast('Account created successfully!');
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1000);
      } catch (err) {
        this.authError = err.message;
      }
    },
    
    async logoutUser() {
      try {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (response.ok) {
          this.user = null;
          this.triggerToast('Logged out successfully');
          setTimeout(() => {
            window.location.href = '/index.html';
          }, 1000);
        }
      } catch (err) {
        console.error('Error logging out:', err);
      }
    },
    
    // 3. Catalog & Search Actions
    async fetchAssets() {
      this.loading = true;
      try {
        const response = await fetch('/api/assets');
        const data = await response.json();
        if (response.ok) {
          this.assets = data;
        }
      } catch (err) {
        console.error('Error fetching assets:', err);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchFavorites() {
      this.loading = true;
      try {
        const response = await fetch('/api/assets/favorites');
        const data = await response.json();
        if (response.ok) {
          this.assets = data;
        }
      } catch (err) {
        console.error('Error fetching favorite assets:', err);
      } finally {
        this.loading = false;
      }
    },
    
    setCategory(category) {
      this.selectedCategory = category;
    },
    
    // 4. Asset Submission Action
    async submitAsset(e) {
      if (e) e.preventDefault();
      this.submitError = null;
      this.submitSuccess = false;
      
      try {
        const response = await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.newAsset)
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Submission failed.');
        }
        
        this.submitSuccess = true;
        this.triggerToast('Asset submitted successfully!');
        // Reset form
        this.newAsset = {
          title: '',
          description: '',
          category: 'css',
          code: '',
          tags: ''
        };
        
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1500);
      } catch (err) {
        this.submitError = err.message;
      }
    },
    
    // 5. Interactive Details & Sandbox Actions
    viewAssetDetails(asset) {
      this.selectedAsset = asset;
      // Triggers Bootstrap modal display
      $('#assetDetailsModal').modal('show');
    },
    
    // Copy CSS/HTML Code block to Clipboard
    copyCode(asset) {
      const codeToCopy = asset.code;
      navigator.clipboard.writeText(codeToCopy)
        .then(() => {
          this.triggerToast('Code copied to clipboard!');
          this.trackDownload(asset);
        })
        .catch(err => {
          console.error('Clipboard copy failed:', err);
        });
    },
    
    // Favorites Toggle
    async toggleFavorite(asset) {
      if (!this.user) {
        this.triggerToast('Please log in to favorite assets');
        return;
      }
      
      try {
        const response = await fetch(`/api/assets/${asset._id}/favorite`, {
          method: 'POST'
        });
        const data = await response.json();
        if (response.ok) {
          if (data.favorited) {
            this.user.favorites.push(asset._id);
            this.triggerToast('Added to Favorites!');
          } else {
            const index = this.user.favorites.indexOf(asset._id);
            if (index !== -1) {
              this.user.favorites.splice(index, 1);
            }
            this.triggerToast('Removed from Favorites');
          }
        }
      } catch (err) {
        console.error('Error toggling favorite:', err);
      }
    },
    
    isFavorited(asset) {
      if (!this.user || !this.user.favorites) return false;
      return this.user.favorites.includes(asset._id);
    },
    
    // Track downloads count
    async trackDownload(asset) {
      try {
        const response = await fetch(`/api/assets/${asset._id}/download`, {
          method: 'POST'
        });
        const data = await response.json();
        if (response.ok) {
          asset.downloads = data.downloads;
        }
      } catch (err) {
        console.error('Error updating download statistics:', err);
      }
    },
    
    async deleteAsset(asset) {
      if (!confirm(`Are you sure you want to delete the asset "${asset.title}"?`)) {
        return;
      }
      try {
        const response = await fetch(`/api/assets/${asset._id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (response.ok) {
          this.triggerToast('Asset deleted successfully');
          this.assets = this.assets.filter(a => a._id !== asset._id);
        } else {
          throw new Error(data.message || 'Deletion failed');
        }
      } catch (err) {
        this.triggerToast(`Error: ${err.message}`);
      }
    }
  },
  
  created() {
    this.checkAuth();
    
    // Determine whether this page should list favorites or general catalog
    const path = window.location.pathname;
    if (path.includes('favorites.html')) {
      this.fetchFavorites();
    } else if (path.includes('submit.html')) {
      // Submit page doesn't need to fetch assets, but let's check auth
      this.checkAuth().then(() => {
        if (!this.user) {
          // If not logged in, redirect to login page after brief moment
          setTimeout(() => {
            if (!this.user) window.location.href = '/login.html';
          }, 1000);
        }
      });
    } else {
      this.fetchAssets();
    }
    
    // Setup online/offline statuses
    window.addEventListener('online', () => { this.isOffline = false; });
    window.addEventListener('offline', () => { this.isOffline = true; });
  }
});
