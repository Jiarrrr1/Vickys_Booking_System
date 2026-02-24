<!-- src/components/ExperienceSection.vue -->
<template>
    <section id="experience">
    <div class="exp-wrapper">

        <!-- Block 1: Our Story -->
        <div class="exp-block fade-up visible">
        <div class="exp-img-panel">
            <img src="@/assets/images/2fd1796e17c43057572d335d66f75a8c0e858f0c.png" alt="Resort Garden View">
        </div>
        <div class="exp-text-panel">
            <div class="section-label"><span>Our Story</span></div>
            <h2>Your Perfect<br>Rural Escape</h2>
            <p>Surrounded by peaceful greenery and open fields, Vicky's Resort offers a quiet countryside escape for relaxation and bonding. Enjoy private accommodations, open outdoor spaces, and a refreshing pool — perfect for families and small groups seeking comfort.</p>
            <a href="gallery.html" class="btn-ghost">Explore Gallery</a>
        </div>
        </div>

        <!-- Block 2: Amenities (reversed layout) -->
        <div class="exp-block reverse fade-up visible">  <!-- Added 'visible' class -->
        <div class="exp-img-panel">
            <img src="@/assets/images/6e6b6e5e3b19d5deb5ed88163212117e89cba45e.png" alt="Pool Area">
        </div>
        <div class="exp-text-panel">
            <div class="section-label"><span>Amenities</span></div>
            <h2>Perfect for<br>Bonding &amp; Events</h2>
            <p>From swimming and outdoor bonding to quiet nights under the stars, every moment at Vicky's Resort is designed for connection, fun, and lasting memories. Our pools are open and waiting for you.</p>
            <a href="gallery.html" class="btn-ghost">View Pools</a>
        </div>
        </div>

    </div>
    </section>
</template>

<script setup>
// You can add intersection observer here later for scroll animations
</script>

<style scoped>
#experience {
    padding: 5rem 5%;
}

.exp-wrapper {
    max-width: 1200px;
    margin: 0 auto;
}

.exp-block {
    display: flex;
    align-items: center;
    gap: 4rem;
    margin-bottom: 6rem;
}

.exp-img-panel {
    flex: 1;
    overflow: hidden;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.exp-img-panel img {
    width: 100%;
    height: 520px;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.exp-img-panel img:hover {
    transform: scale(1.05);
}

.exp-text-panel {
    flex: 1;
    padding: 2rem;
}

.section-label {
    margin-bottom: 1rem;
}

.section-label span {
    background-color: var(--gold);
    color: white;
    padding: 0.3rem 1rem;
    border-radius: 25px;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 1px;
    display: inline-block;
}

.exp-text-panel h2 {
    font-size: 2.5rem;
    color: var(--white);
    margin-bottom: 1.5rem;
    line-height: 1.2;
}

.exp-text-panel p {
    font-size: 1.1rem;
    color: #666;
    line-height: 1.8;
    margin-bottom: 2rem;
}

.btn-ghost {
    display: inline-block;
    padding: 0.8rem 2rem;
    border: 2px solid var(--gold);
    color: var(--gold);
    text-decoration: none;
    font-weight: 600;
    border-radius: 50px;
    transition: all 0.3s ease;
}

.btn-ghost:hover {
    background-color: var(--gold)   ;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(230, 126, 34, 0.3);
}

/* Animation classes */
.fade-up {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease, transform 0.8s ease;
}

.fade-up.visible {
    opacity: 1;
    transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
    .exp-block {
        flex-direction: column !important;
        gap: 2rem;
        margin-bottom: 4rem;
    }
    
    .exp-img-panel img {
        height: 300px;
    }
    
    .exp-text-panel {
        padding: 1rem 0;
        text-align: center;
    }
    
    .exp-text-panel h2 {
        font-size: 2rem;
    }
    
    .exp-text-panel p {
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .exp-text-panel h2 {
        font-size: 1.8rem;
    }
}
</style>