<template>
  <section id="rooms" class="room-section">
    <div class="room-header">
      <h1>Our Rooms</h1>
      <p>
        Each room is thoughtfully designed to provide you with comfort, privacy, and a peaceful
        atmosphere.
      </p>
    </div>
    <div class="room-item-con">
      <table>
        <tbody>
          <tr>
            <td>
              <div class="room-item">
                <h3>Rose Room</h3>
                <div class="second-layer">
                  <div class="left-side">
                    <i><img src="/src/images/userIcon.svg" alt="" /></i>
                    <p>Good for 5-6 pax</p>
                  </div>
                  <div class="right-side">
                    <p>
                      <i>₱1,000</i>
                      / night
                    </p>
                  </div>
                </div>
                <div class="third-layer">
                  <h4>Amenities:</h4>
                  <div>
                    <i><img src="/src/images/airconIcon.svg" alt="" /></i>
                    <p>Air Conditioning</p>
                  </div>
                  <div>
                    <i><img src="/src/images/bedIcon.svg" alt="" /></i>
                    <p>Double Deck Bed</p>
                  </div>
                </div>
                <button @click="openBookingModal('Rose Room')">Book Now</button>
              </div>
            </td>
            <td>
              <div class="room-item">
                <h3>Tulip Room</h3>
                <div class="second-layer">
                  <div class="left-side">
                    <i><img src="/src/images/userIcon.svg" alt="" /></i>
                    <p>Good for 5-6 pax</p>
                  </div>
                  <div class="right-side">
                    <p>
                      <i>₱1,000</i>
                      / night
                    </p>
                  </div>
                </div>
                <div class="third-layer">
                  <h4>Amenities:</h4>
                  <div>
                    <i><img src="/src/images/airconIcon.svg" alt="" /></i>
                    <p>Air Conditioning</p>
                  </div>
                  <div>
                    <i><img src="/src/images/bedIcon.svg" alt="" /></i>
                    <p>Double Deck Bed</p>
                  </div>
                </div>
                <button @click="openBookingModal('Tulip Room')">Book Now</button>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div class="room-item">
                <h3>Callalily Room</h3>
                <div class="second-layer">
                  <div class="left-side">
                    <i><img src="/src/images/userIcon.svg" alt="" /></i>
                    <p>Good for 5-6 pax</p>
                  </div>
                  <div class="right-side">
                    <p>
                      <i>₱1,000</i>
                      / night
                    </p>
                  </div>
                </div>
                <div class="third-layer">
                  <h4>Amenities:</h4>
                  <div>
                    <i><img src="/src/images/airconIcon.svg" alt="" /></i>
                    <p>Air Conditioning</p>
                  </div>
                  <div>
                    <i><img src="/src/images/bedIcon.svg" alt="" /></i>
                    <p>Double Deck Bed</p>
                  </div>
                </div>
                <button @click="openBookingModal('Callalily Room')">Book Now</button>
              </div>
            </td>
            <td>
              <div class="room-item">
                <h3>Bamboo Room</h3>
                <div class="second-layer">
                  <div class="left-side">
                    <i><img src="/src/images/userIcon.svg" alt="" /></i>
                    <p>Good for 5-6 pax</p>
                  </div>
                  <div class="right-side">
                    <p>
                      <i>₱1,000</i>
                      / night
                    </p>
                  </div>
                </div>
                <div class="third-layer">
                  <h4>Amenities:</h4>
                  <div>
                    <i><img src="/src/images/airconIcon.svg" alt="" /></i>
                    <p>Air Conditioning</p>
                  </div>
                  <div>
                    <i><img src="/src/images/bedIcon.svg" alt="" /></i>
                    <p>Double Deck Bed</p>
                  </div>
                </div>
                <button @click="openBookingModal('Bamboo Room')">Book Now</button>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div class="room-item">
                <h3>Stargazer Room</h3>
                <div class="second-layer">
                  <div class="left-side">
                    <i><img src="/src/images/userIcon.svg" alt="" /></i>
                    <p>Good for 5-6 pax</p>
                  </div>
                  <div class="right-side">
                    <p>
                      <i>₱1,000</i>
                      / night
                    </p>
                  </div>
                </div>
                <div class="third-layer">
                  <h4>Amenities:</h4>
                  <div>
                    <i><img src="/src/images/airconIcon.svg" alt="" /></i>
                    <p>Air Conditioning</p>
                  </div>
                  <div>
                    <i><img src="/src/images/bedIcon.svg" alt="" /></i>
                    <p>Double Deck Bed</p>
                  </div>
                </div>
                <button @click="openBookingModal('Stargazer Room')">Book Now</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <BookingModal 
      ref="bookingModal"
      :roomName="selectedRoom"
      @booking-submitted="handleBookingSubmitted"
    />
  </section>
</template>

<script>
import BookingModal from '../modals/BookingModal.vue'

export default {
  name: 'Rooms',
  components: {
    BookingModal
  },
  data() {
    return {
      selectedRoom: 'Rose Room'
    }
  },
  methods: {
    openBookingModal(roomName) {
      this.selectedRoom = roomName
      this.$refs.bookingModal.openModal()
    },
    handleBookingSubmitted(bookingData) {
      console.log('Booking submitted:', bookingData)
      // Handle the booking data (send to API, etc.)
    }
  }
}
</script>