class SessionsController < ApplicationController
  def new
  end

  def create
    user = User.find_by(email: params[:email])
    # TODO show alert specific to passwords not matching
    if user.present? && user.authenticate(params[:password])
      session[:user_id] = user.id
      redirect_to user.list.path, notice: "Logged in successfully."
    else
      flash.now[:alert] = "Invalid email or password."
      render :new
    end
  end

  def destroy
    session[:user_id] = nil
    redirect_to root_path, notice: "Logged out."
  end
end